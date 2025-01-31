# 
# Do NOT Edit the Auto-generated Part!
# Generated by: spectacle version 0.32
# 

Name: harbour-habitsailor 

# >> macros
# << macros
%define _binary_payload w2.xzdio
%{!?qtc_qmake:%define qtc_qmake %qmake}
%{!?qtc_qmake5:%define qtc_qmake5 %qmake5}
%{!?qtc_make:%define qtc_make make}
%{?qtc_builddir:%define _builddir %qtc_builddir}

Summary:    Habitica client
Version:    0.9
Release:    1
Group:      Applications/Internet
License:    GPLv3
URL:        https://github.com/poetaster/HabitSailor
Source0:    %{name}-%{version}.tar.bz2
Requires:   sailfishsilica-qt5 >= 1.1.0
Requires:   libsailfishapp-launcher

BuildRequires:  qt5-qttools-linguist
BuildRequires:  pkgconfig(sailfishapp)
BuildRequires:  pkgconfig(Qt5Core)
BuildRequires:  pkgconfig(Qt5Qml)
BuildRequires:  pkgconfig(Qt5Quick)
BuildRequires:  desktop-file-utils

%description
Habitica unofficial client for SailfishOS implementing essetial features
like showing profile and status, checking, editing, deleting tasks and
their checklists, buying health potions and custom rewards, accessing private
messages, party chat and quests.

%if "%{?vendor}" == "chum"
PackageName: HabitSailor
Type: desktop-application
Categories:
 - News
 - Utility
DeveloperName: Jérémy Farnaud
Custom:
 - RepoType: github
 - Repo: https://github.com/poetaster/HabitSailor
Icon: https://raw.githubusercontent.com/poetaster/HabitSailor/master/icons/172x172/harbour-habitsailor.png
Screenshots:
Url:
  Homepage: https://github.com/poetaster/HabitSailor
%endif

%prep
%setup -q -n %{name}-%{version}

# >> setup
# << setup

%build
# >> build pre
# << build pre

%qtc_qmake5 

%qtc_make %{?_smp_mflags}

# >> build post
# << build post

%install
rm -rf %{buildroot}
# >> install pre
# << install pre
%qmake5_install

# >> install post
# << install post

desktop-file-install --delete-original       \
  --dir %{buildroot}%{_datadir}/applications             \
   %{buildroot}%{_datadir}/applications/*.desktop

%files
%defattr(-,root,root,-)
%{_bindir}
%{_datadir}/%{name}
%{_datadir}/icons/hicolor/*/apps/%{name}.png
%{_datadir}/applications/%{name}.desktop
%{_datadir}/%{name}/qml
# >> files
# << files
