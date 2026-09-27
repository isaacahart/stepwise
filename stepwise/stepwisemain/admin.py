from django.contrib import admin
from django.db import models
from .models import Universe, Proposition, Theorem, Axiom, Level, GameState, Suggestion, BugReport

admin.site.register(Proposition)
admin.site.register(Theorem)
admin.site.register(Axiom)
admin.site.register(Level)
admin.site.register(Universe)
admin.site.register(GameState)
admin.site.register(BugReport)
admin.site.register(Suggestion)