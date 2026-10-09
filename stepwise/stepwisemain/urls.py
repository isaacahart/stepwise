from django.urls import path

from . import views

app_name = "stepwisemain"
urlpatterns = [
    path("", views.IndexView.as_view(), name="index"),
    path("projects/new", views.CreateUniverse.as_view(), name="makeuniverse"),
    path("projects/<int:pk>/edit", views.UpdateUniverse.as_view(), name="edituniverse"),
    path("projects/<int:unvid>/level/new", views.CreateLevel.as_view(), name="makelevel"),
    path("projects/<int:unvid>/level/<int:pk>/edit", views.UpdateLevel.as_view(), name="editlevel"),
    path("projects/<int:unvid>/level/<int:pk>/delete", views.DeleteLevel.as_view(), name="deletelevel"),
    path("projects/<int:unvid>/level/<int:levelid>/theorem/new", views.CreateTheorem.as_view(), name="maketheorem"),
    path("projects/<int:unvid>/level/<int:levelid>/theorem/<int:pk>/edit", views.UpdateProposition.as_view(), name="edittheorem"),
    path("projects/<int:unvid>/level/<int:levelid>/axiom/new", views.CreateAxiom.as_view(), name="makeaxiom"),
    path("projects/<int:unvid>/level/<int:levelid>/theorem/<int:pk>/delete", views.DeleteAxiom.as_view(), name="deleteaxiom"),
    path("projects/<int:unvid>/level/<int:pk>/playtest", views.PlaytestLevel.as_view(), name="playtestlevel"),
    path("projects/<int:unvid>/newgame", views.new_game, name="newgame"),
    path("play/<int:pk>", views.PlayGame.as_view(), name="playgame"),
    path("play/<int:pk>/level/<int:lvlid>", views.PlayLevel.as_view(), name="playlevel"),
    path("play/project/<int:pk>", views.PlayUniverseSignedOut.as_view(), name="playsignedout"),
    path("play/project/<int:pk>/level/<int:lvlid>", views.PlayLevelSignedOut.as_view(), name="playlevelsignedout"),
    path("play/<int:gmsid>/like", views.like_game, name="likegame"),
    path("users/<int:userid>/projects", views.UserUniverses.as_view(), name="useruniverses"),
    path("users/<int:userid>/games", views.UserGames.as_view(), name="usergames"),
    path("users/<int:userid>/likedprojects", views.UserLikedUniverses.as_view(), name="userliked"),
    path("users/<int:pk>", views.UserProfile.as_view(), name="profile"),
    path("projects", views.ProjectList.as_view(), name="allprojects"),
    path("projects/recent", views.RecentProjects.as_view(), name="recentprojects"),
    path("projects/mostplayed", views.MostPlayedProjects.as_view(), name="mostplayedprojects"),
    path("projects/mostliked", views.MostLikedProjects.as_view(), name="mostlikedprojects"),
    path("reportbugs", views.ReportBugsView.as_view(), name="reportbugs"),
    path("suggest", views.MakeSuggestionView.as_view(), name="suggest"),
    path("projects/<int:pk>/solution", views.UniverseSolution.as_view(), name="universesolution"),
    path("projects/<int:unvid>/level/<int:pk>/solution", views.LevelSolution.as_view(), name="levelsolution"),
]