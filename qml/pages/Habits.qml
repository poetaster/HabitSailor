import QtQuick 2.0
import Sailfish.Silica 1.0
import "../components"
import "../model.js" as Model

Page {

    SilicaListView {
        id: list
        anchors.fill: parent

        model: ListModel {}

        PullDownMenu {
            MenuItem {
                text: qsTr("New Habit")
                onClicked: {
                    pageStack.push("TaskEdit.qml", { taskType: "habit" });
                }
            }
        }

        header: PageHeader {
            title: qsTr("Habits")
        }

        VerticalScrollDecorator {}

        // TODO placeholder for empty ListElement

        delegate: TaskItem {
            id: taskItem
            showColor: model.up || model.down

            menu: ContextMenu {
                id: contextMenu

                function clickItem(dir) {
                    taskItem.enabled = false;
                    taskItem.busy = true;
                    Model.habitClick(model.id, dir, function (ok, c) {
                        taskItem.enabled = true;
                        taskItem.busy = false;
                        if (ok)
                            list.model.setProperty(model.index, "color", c)
                    });
                    hideMenu();
                }

                Row {
                    width: parent.width
                    height: Theme.itemSizeLarge

                    HabitButton {
                        width: model.up ? parent.width / 2 : parent.width
                        imageDown: true
                        visible: model.down
                        onClicked: contextMenu.clickItem("down");
                    }

                    HabitButton {
                        width: model.down ? parent.width / 2 : parent.width
                        visible: model.up
                        onClicked: contextMenu.clickItem("up");
                    }

                    Label {
                        anchors.verticalCenter: parent.verticalCenter
                        width: parent.width
                        horizontalAlignment: Text.AlignHCenter
                        visible: !model.down && !model.up
                        text: qsTr("This item has no enabled buttons")
                        color: Theme.secondaryHighlightColor
                    }
                }

                MenuItem {
                    text: qsTr("Edit")
                    onClicked: {
                        pageStack.push("TaskEdit.qml",
                                       {
                                           mode: "edit",
                                           taskType: "habit",
                                           taskId: model.id,
                                       });
                    }
                }

                MenuItem {
                    text: qsTr("Delete")
                    onClicked: {
                        taskItem.remorse(qsTr("Deleting"), function () {
                            taskItem.enabled = false;
                            taskItem.busy = true;
                            Model.deleteTask(model.id, function (ok) {
                                if (!ok) {
                                    taskItem.enabled = true;
                                    taskItem.busy = false;
                                }
                            });
                        });
                    }
                }
            }

            onClicked: { showMenu(); }

        }
    }

    function update() {
        list.model.clear();
        Model.listHabits().forEach(function (habit) {
            list.model.append(habit);
        });
    }

    Component.onCompleted: {
        update();
    }

    Connections {
        target: Model.signals
        onUpdateTasks: update()
    }

}

