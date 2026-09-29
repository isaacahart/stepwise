from django.db import models
from django.conf import settings
import json

class Universe(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(max_length=1000, blank=True)
    update_date = models.DateTimeField(null=True)
    is_shared = models.BooleanField(default=False)
    edges = models.JSONField(default=list)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    plays = models.IntegerField(default=0)
    likes = models.IntegerField(default=0)
    liked_by = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="likedby", blank=True)

    def __str__(self):
        return self.name

    @classmethod
    def get_default_pk(cls):
        unv, created = cls.objects.get_or_create(
            name='default universe',
        )
        return unv.pk

    def is_liked_by(self, user):
        """Returns True if the user liked the universe"""
        if user.is_authenticated:
            return self.liked_by.filter(pk=user.pk).exists()
        return False

    def get_levels_before(self, lvlpk, lvls):
        for edge in self.edges:
            if edge["to"] == lvlpk:
                if edge["from"] not in lvls:
                    lvls.append(edge["from"])
                    self.get_levels_before(edge["from"], lvls)
        return lvls

    def theorems_in_levels(self, lvls):
        thms = []
        for pk in reversed(lvls):
            level = Level.objects.get(pk=pk)
            thms.extend(level.axiom_set.all())
            if (not level.is_practice):
                thms.append(level.theorem)
        return thms

    def special_blocks_in_levels(self, lvls):
        blks = []
        for pk in reversed(lvls):
            level = Level.objects.get(pk=pk)
            blks.extend(level.new_special_blocks)
        return blks

    def get_unlocked_levels(self, completeLevels):
        unlocked = []
        for level in self.level_set.all():
            u = True
            for edge in self.edges:
                if edge['to'] == level.pk and edge['from'] not in completeLevels:
                    u = False
                    break
            if u:
                unlocked.append(level.pk)
        return unlocked



class GameState(models.Model):
    universe = models.ForeignKey(Universe, on_delete=models.CASCADE)
    levels_complete = models.JSONField(default=list)
    proof_steps = models.JSONField(default=dict)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)

def default_coord():
    return "{\"x\":100,\"y\":100}"

class Level(models.Model):
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default="#000000")
    help_text = models.TextField(max_length=2000, default="", blank=True)
    is_practice = models.BooleanField(default=False)
    universe = models.ForeignKey(Universe, on_delete=models.CASCADE, default=Universe.get_default_pk)
    proof_steps = models.JSONField(default=list, blank=True)
    coord = models.JSONField(default=default_coord)
    new_special_blocks = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.name
    
    def get_unlocked_theorems(self):
        lvls = []
        self.universe.get_levels_before(self.pk, lvls)
        thms = self.universe.theorems_in_levels(lvls)
        thms.extend(self.axiom_set.all())
        return sort_theorems_by_category(thms)

    def get_unlocked_special_blocks(self):
        lvls = []
        self.universe.get_levels_before(self.pk, lvls)
        blks = self.universe.special_blocks_in_levels(lvls)
        blks.extend(self.new_special_blocks)
        return blks

def sort_theorems_by_category(thms):
    out = {}
    for thm in thms:
        if thm.category in out:
            out[thm.category].append(thm)
        else:
            out[thm.category] = [thm]
    return out

def default_statement():
    return {"type": "simple", "relation": "", "objects":[]}

class Proposition(models.Model):
    statement = models.JSONField(default=default_statement)
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default="#000000")
    category = models.CharField(max_length=40, default="", blank=True)

    def __str__(self):
        return self.name
    
    def get_statement(self):
        return json.dumps(self.statement)
    
class Theorem(Proposition):
    level = models.OneToOneField(Level, on_delete=models.CASCADE)

class Axiom(Proposition):
    level = models.ForeignKey(Level, on_delete=models.CASCADE)

class BugReport(models.Model):
    where_it_occurs = models.TextField()
    description = models.TextField()
    how_to_reproduce = models.TextField()

    def __str__(self):
        return self.description

class Suggestion(models.Model):
    text = models.TextField()

    def __str__(self):
        return self.text