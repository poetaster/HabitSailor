import QtQuick 2.0
import Sailfish.Silica 1.0
import "../model.js" as Model

Page {

    SilicaListView {
        id: list
        anchors.fill: parent

        model: ListModel {}

        header: PageHeader {
            title: "Habits"
        }

        PullDownMenu {
            MenuItem {
                text: "Refresh"
            }
        }

        VerticalScrollDecorator {}

        delegate: ListItem {
            width: parent.width

            function habitUpdate(ok, c) {
                if (ok) {
                    colorIndicator.color = c;
                    model.color = c;
                }
            }

            menu: ContextMenu {
                id: contextMenu
                Row {
                    width: parent.width
                    height: Theme.itemSizeLarge
                    BackgroundItem {
                        height: parent.height
                        width: model.up ? parent.width / 2 : parent.width
                        visible: model.down
                        Image {
                            anchors.centerIn: parent
                            source: "image://theme/icon-m-remove"
                            width: Theme.itemSizeMedium
                            height: width
                        }
                        onClicked: {
                            Model.habitClick(model.id, "down", habitUpdate);
                            hideMenu();
                        }
                    }
                    BackgroundItem {
                        height: parent.height
                        width: model.down ? parent.width / 2 : parent.width
                        visible: model.up
                        Image {
                            anchors.centerIn: parent
                            source: "image://theme/icon-m-add"
                            width: Theme.itemSizeMedium
                            height: width
                        }
                        onClicked: {
                            Model.habitClick(model.id, "up", habitUpdate);
                            hideMenu();
                        }
                    }
                    Label {
                        anchors.verticalCenter: parent.verticalCenter
                        width: parent.width
                        horizontalAlignment: Text.AlignHCenter
                        visible: !model.down && !model.up
                        text: "This item has no enabled buttons"
                        color: Theme.secondaryHighlightColor
                    }
                }
            }

            Row {
                x: Theme.horizontalPageMargin
                width: parent.width - 2 * Theme.horizontalPageMargin
                spacing: Theme.paddingLarge
                height: Theme.itemSizeSmall

                Rectangle {
                    id: colorIndicator
                    anchors.verticalCenter: parent.verticalCenter
                    width: parent.height / 3
                    height: width
                    color: model.color
                    opacity: model.up || model.down ? 1 : 0
                }

                Label {
                    anchors.verticalCenter: parent.verticalCenter
                    text: model.text
                    width: parent.width - x
                    maximumLineCount: 2
                    wrapMode: Text.WrapAtWordBoundaryOrAnywhere
                    elide: Text.ElideRight
                    font.pixelSize: Theme.fontSizeSmall
                }
            }

            onClicked: {
                showMenu();
            }
        }
    }

    Component.onCompleted: {
        var habits = Model.listHabits();
        for (var i in habits) {
            list.model.append(habits[i]);
        }
    }

}

