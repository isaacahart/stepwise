from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.views import generic
from django.views.generic.base import TemplateView
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse, reverse_lazy
from django.core.exceptions import ObjectDoesNotExist, PermissionDenied, ValidationError
import json
from .models import Universe, Proposition, Theorem, Axiom, Level, GameState, BugReport, Suggestion
from .forms import PropositionForm, LevelForm, UniverseForm, PlayLevelForm, AxiomForm, TheoremForm, BugReportForm, SuggestionForm
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from django.contrib.auth.forms import UserCreationForm

class IndexView(generic.TemplateView):
    template_name = "stepwisemain/index.html"

class CreateUniverse(generic.CreateView, LoginRequiredMixin):
    model = Universe
    form_class = UniverseForm
    template_name = "stepwisemain/make_universe.html"

    def form_valid(self, form):
        form.instance.owner = self.request.user
        form.instance.update_date = timezone.now()
        return super().form_valid(form)

    def get_success_url(self):
        if self.request.POST.get("new-level"):
            return reverse("stepwisemain:makelevel", kwargs={'unvid':self.object.pk})
        else:
            return reverse("stepwisemain:useruniverses", kwargs={"userid": self.request.user.pk})

def coord_valid(coord):
    if type(coord) != dict:
        return False
    if "x" not in coord or "y" not in coord:
        return False
    if type(coord["x"]) != int or type(coord["y"]) != int:
        return False
    return True
    
class UpdateUniverse(generic.UpdateView):
    model = Universe
    form_class = UniverseForm
    template_name = "stepwisemain/make_universe.html"

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if obj.owner == self.request.user:
            return obj
        else:
            raise PermissionDenied

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["levels"] = self.object.level_set.all()
        return context

    def form_valid(self, form):
        form.instance.update_date = timezone.now()
        for lvl in form.instance.level_set.all():
            coord = self.request.POST.get("level"+str(lvl.pk))
            if coord_valid(json.loads(coord)):
                lvl.coord = coord
                lvl.save()
        return super().form_valid(form)

    def get_success_url(self):
        if self.request.POST.get("new-level"):
            return reverse("stepwisemain:makelevel", kwargs={'unvid':self.kwargs["pk"]})
        elif self.request.POST.get("edit-level"):
            lvlPk = int(self.request.POST.get("edit-level"))
            return reverse("stepwisemain:editlevel", kwargs={'unvid':self.kwargs["pk"], "pk":lvlPk})
        elif self.request.POST.get("play-level"):
            lvlPk = int(self.request.POST.get("play-level"))
            return reverse("stepwisemain:playtestlevel", kwargs={'unvid':self.kwargs["pk"], "pk":lvlPk})
        else:
            return reverse("stepwisemain:useruniverses", kwargs={"userid": self.request.user.pk})

class CreateLevel(generic.CreateView):
    model = Level
    form_class = LevelForm
    template_name = "stepwisemain/make_level.html"

    def dispatch(self, request, *args, **kwargs):
        if Universe.objects.get(pk=kwargs["unvid"]).owner == self.request.user:
            return super().dispatch(request, *args, **kwargs)
        else:
            raise PermissionDenied

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["unvid"] = self.kwargs["unvid"]
        return context

    def form_valid(self, form):
        form.instance.universe = Universe.objects.get(pk=self.kwargs["unvid"])
        return super().form_valid(form)

    def get_success_url(self):
        if self.request.POST.get("edit-theorem"):
            return reverse("stepwisemain:maketheorem", kwargs={'unvid':self.kwargs["unvid"], 'levelid':self.object.pk})
        elif self.request.POST.get("new-axiom"):
            return reverse("stepwisemain:makeaxiom", kwargs={'unvid':self.kwargs["unvid"], "levelid":self.object.pk})
        elif self.request.POST.get("play-level"):
            return reverse("stepwisemain:playtestlevel", kwargs={'unvid':self.kwargs["unvid"], 'pk':self.object.pk})
        else:
            return reverse("stepwisemain:edituniverse", kwargs={'pk':self.kwargs["unvid"]})
        
class UpdateLevel(generic.UpdateView):
    model = Level
    form_class = LevelForm
    template_name = "stepwisemain/make_level.html"

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if obj.universe.owner == self.request.user:
            return obj
        else:
            raise PermissionDenied

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["axioms"] = self.object.axiom_set.all()
        context["unvid"] = self.kwargs["unvid"]
        return context

    def get_success_url(self):
        if self.request.POST.get("edit-theorem"):
            try:
                thm = self.object.theorem
                return reverse("stepwisemain:edittheorem", kwargs={'unvid':self.kwargs["unvid"], "levelid":self.object.pk, "pk":thm.pk})
            except ObjectDoesNotExist:
                return reverse("stepwisemain:maketheorem", kwargs={'unvid':self.kwargs["unvid"], "levelid":self.object.pk})
        elif self.request.POST.get("new-axiom"):
            return reverse("stepwisemain:makeaxiom", kwargs={'unvid':self.kwargs["unvid"], "levelid":self.object.pk})
        elif self.request.POST.get("edit-axiom"):
            axPk = int(self.request.POST.get("edit-axiom"))
            return reverse("stepwisemain:edittheorem", kwargs={'unvid':self.kwargs["unvid"], "levelid":self.object.pk, "pk":axPk})
        elif self.request.POST.get("play-level"):
            return reverse("stepwisemain:playtestlevel", kwargs={'unvid':self.kwargs["unvid"], 'pk':self.object.pk})
        else:
            return reverse("stepwisemain:edituniverse", kwargs={'pk':self.kwargs["unvid"]})
        
class DeleteLevel(generic.DeleteView):
    model = Level
    template_name = "stepwisemain/delete_level.html"

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if obj.universe.owner == self.request.user:
            return obj
        else:
            raise PermissionDenied

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["unvid"] = self.kwargs["unvid"]
        return context
    
    def get_success_url(self):
        return reverse("stepwisemain:edituniverse", kwargs={'pk':self.kwargs["unvid"]})
    
    
class CreateProposition(generic.CreateView):
    model = Proposition
    form_class = PropositionForm
    template_name = "stepwisemain/make_theorem.html"

    def dispatch(self, request, *args, **kwargs):
        if Universe.objects.get(pk=kwargs["unvid"]).owner == self.request.user:
            return super().dispatch(request, *args, **kwargs)
        else:
            raise PermissionDenied

    def get_success_url(self):
        return reverse("stepwisemain:editlevel", kwargs={'unvid':self.kwargs["unvid"], 'pk':self.kwargs["levelid"]})

class CreateTheorem(CreateProposition):
    model = Theorem
    form_class = TheoremForm

    def form_valid(self, form):
        form.instance.level = Level.objects.get(pk=self.kwargs["levelid"])
        return super().form_valid(form)

class CreateAxiom(CreateProposition):
    model = Axiom
    form_class = AxiomForm

    def form_valid(self, form):
        form.instance.level = Level.objects.get(pk=self.kwargs["levelid"])
        return super().form_valid(form)

class UpdateProposition(generic.UpdateView):
    model = Proposition
    form_class = PropositionForm
    template_name = "stepwisemain/make_theorem.html"

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if Universe.objects.get(pk=self.kwargs["unvid"]).owner == self.request.user:
            return obj
        else:
            raise PermissionDenied

    def get_success_url(self):
        return reverse("stepwisemain:editlevel", kwargs={'unvid':self.kwargs["unvid"], 'pk':self.kwargs["levelid"]})
    
class DeleteAxiom(generic.DeleteView):
    model = Axiom
    template_name = "stepwisemain/delete_axiom.html"

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if obj.level.universe.owner == self.request.user:
            return obj
        else:
            raise PermissionDenied

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["unvid"] = self.kwargs["unvid"]
        context["levelid"] = self.kwargs["levelid"]
        return context
    
    def get_success_url(self):
        return reverse("stepwisemain:editlevel", kwargs={'unvid':self.kwargs["unvid"], 'pk':self.kwargs["levelid"]})
    

class PlaytestLevel(generic.FormView):
    template_name = "stepwisemain/play_level.html"
    form_class = PlayLevelForm

    def setup(self, request, *args, **kwargs):
        super().setup(request, *args, **kwargs)
        self.object = get_object_or_404(Level, pk=kwargs['pk'])
        if self.object.universe.owner != self.request.user:
            raise PermissionDenied

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["unvid"] = self.kwargs["unvid"]
        lvl = self.object
        context["proof_steps"] = json.dumps(lvl.proof_steps)
        context["theorem_statement"] = json.dumps(lvl.theorem.statement)
        context["level"] = lvl
        context["help_text"] = lvl.help_text.splitlines()
        context["unlocked_thms"] = lvl.get_unlocked_theorems()
        context["new_special_blocks"] = json.dumps(lvl.get_unlocked_special_blocks())
        return context

    def form_valid(self, form):
        self.object.proof_steps = form.cleaned_data["proof_steps"]
        self.object.save()
        return super().form_valid(form)
    
    def get_success_url(self):
        return reverse("stepwisemain:edituniverse", kwargs={'pk': self.kwargs["unvid"]})

def new_game(request, unvid):
    try:
        unv = get_object_or_404(Universe, pk=unvid)
    except Universe.DoesNotExist:
        raise Http404("Universe does not exist")
    unv.plays += 1
    unv.save()
    if request.user.is_authenticated:
        gms = GameState(universe=unv, user=request.user)
        gms.save()
        return redirect("stepwisemain:playgame", pk=gms.pk)
    else:
        if "played"+str(unvid) not in request.session:
            request.session["played"+str(unvid)] = {"levels_complete": [], "proof_steps": {}}
        return redirect("stepwisemain:playsignedout", pk=unvid)

class PlayGame(generic.DetailView):
    template_name = "stepwisemain/play_game.html"
    model = GameState

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if obj.user == self.request.user:
            return obj
        else:
            raise PermissionDenied

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        gms = GameState.objects.get(pk=self.kwargs["pk"])
        context["game_state"] = gms
        context["universe"] = gms.universe
        context["levels_complete"] = gms.levels_complete
        context["unlocked"] = gms.universe.get_unlocked_levels(gms.levels_complete)
        context["is_liked"] = gms.universe.liked_by.filter(pk=self.request.user.pk).exists()
        return context

class PlayUniverseSignedOut(generic.TemplateView):
    template_name = "stepwisemain/play_game.html"

    def dispatch(self, request, *args, **kwargs):
        if "played"+str(kwargs["pk"]) not in request.session:
            return redirect("stepwisemain:index")
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["universe"] = Universe.objects.get(pk=kwargs["pk"])
        context["levels_complete"] = self.request.session["played"+str(kwargs["pk"])]["levels_complete"]
        context["unlocked"] = context["universe"].get_unlocked_levels(context["levels_complete"])
        return context

class PlayLevel(generic.FormView):
    template_name = "stepwisemain/play_level.html"
    form_class = PlayLevelForm

    def setup(self, request, *args, **kwargs):
        super().setup(request, *args, **kwargs)
        self.object = get_object_or_404(GameState, pk=kwargs['pk'])
        if self.object.user != self.request.user:
            raise PermissionDenied

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        gms = self.object
        if str(self.kwargs["lvlid"]) in gms.proof_steps:
            context["proof_steps"] = json.dumps(gms.proof_steps[str(self.kwargs["lvlid"])])
        else:
            context["proof_steps"] = "[]"
        context["unvid"] = gms.universe.pk
        lvl = Level.objects.get(pk=self.kwargs["lvlid"])
        context["theorem_statement"] = json.dumps(lvl.theorem.statement)
        context["level"] = lvl
        context["help_text"] = lvl.help_text.splitlines()
        context["unlocked_thms"] = lvl.get_unlocked_theorems()
        context["new_special_blocks"] = json.dumps(lvl.get_unlocked_special_blocks())
        return context

    def form_valid(self, form):
        self.object.proof_steps[self.kwargs["lvlid"]] = form.cleaned_data["proof_steps"]
        if (self.request.POST.get("completed") == "true"):
            if (self.kwargs["lvlid"] not in self.object.levels_complete):
                self.object.levels_complete.append(self.kwargs["lvlid"])
        else:
            if (self.kwargs["lvlid"] in self.object.levels_complete):
                self.object.levels_complete.remove(self.kwargs["lvlid"])

        self.object.save()
        return super().form_valid(form)
    
    def get_success_url(self):
        return reverse("stepwisemain:playgame", kwargs={'pk': self.kwargs["pk"]})

def like_game(request, gmsid):
    if not request.user.is_authenticated:
        return redirect("stepwisemain:index")

    gms = get_object_or_404(GameState, pk=gmsid)
    unv = gms.universe
    if unv.liked_by.filter(pk=request.user.pk).exists():
        unv.liked_by.remove(request.user)
        unv.likes -= 1
    else:
        unv.liked_by.add(request.user)
        unv.likes += 1
    unv.save()

    return redirect("stepwisemain:playgame", pk=gms.pk)


class PlayLevelSignedOut(generic.TemplateView):
    template_name = "stepwisemain/play_level.html"

    def dispatch(self, request, *args, **kwargs):
        if "played"+str(kwargs["pk"]) not in request.session:
            return redirect("stepwisemain:index")
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        proofSteps = self.request.session["played"+str(kwargs["pk"])]["proof_steps"]
        if str(self.kwargs["lvlid"]) in proofSteps:
            context["proof_steps"] = json.dumps(proofSteps[str(self.kwargs["lvlid"])])
        else:
            context["proof_steps"] = "[]"
        context["unvid"] = kwargs["pk"]
        lvl = Level.objects.get(pk=self.kwargs["lvlid"])
        context["theorem_statement"] = json.dumps(lvl.theorem.statement)
        context["level"] = lvl
        context["help_text"] = lvl.help_text.splitlines()
        context["unlocked_thms"] = lvl.get_unlocked_theorems()
        context["new_special_blocks"] = json.dumps(lvl.get_unlocked_special_blocks())
        return context

    def post(self, request, *args, **kwargs):
        request.session["played"+str(kwargs["pk"])]["proof_steps"][kwargs["lvlid"]] = json.loads(request.POST.get("proof_steps"))
        levelsComplete = request.session["played"+str(kwargs["pk"])]["levels_complete"]
        if (request.POST.get("completed") == "true"):
            if (kwargs["lvlid"] not in levelsComplete):
                request.session["played"+str(kwargs["pk"])]["levels_complete"].append(kwargs["lvlid"])
        else:
            if (kwargs["lvlid"] in levelsComplete):
                request.session["played"+str(kwargs["pk"])]["levels_complete"].remove(kwargs["lvlid"])

        request.session.modified = True
        return redirect("stepwisemain:playsignedout", pk=kwargs["pk"])
    
    def get_success_url(self):
        return reverse("stepwisemain:playsignedout", kwargs={'pk': self.kwargs["pk"]})

class UniverseSolution(generic.TemplateView):
    template_name = "stepwisemain/universe_solution.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["universe"] = Universe.objects.get(pk=kwargs["pk"])
        context["levels_complete"] = context["universe"].level_set.values_list("pk", flat=True)
        context["unlocked"] = context["levels_complete"]
        return context

class LevelSolution(generic.TemplateView):
    template_name = "stepwisemain/play_level.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["unvid"] = kwargs["unvid"]
        lvl = Level.objects.get(pk=self.kwargs["pk"])
        context["proof_steps"] = json.dumps(lvl.proof_steps)
        context["theorem_statement"] = json.dumps(lvl.theorem.statement)
        context["level"] = lvl
        context["help_text"] = lvl.help_text.splitlines()
        context["unlocked_thms"] = lvl.get_unlocked_theorems()
        context["new_special_blocks"] = json.dumps(lvl.get_unlocked_special_blocks())
        return context

    def post(self, request, *args, **kwargs):
        return redirect("stepwisemain:universesolution", pk=kwargs["unvid"])
    
    def get_success_url(self):
        return reverse("stepwisemain:universesolution", kwargs={'pk': self.kwargs["unvid"]})

class UserUniverses(generic.ListView):
    model = Universe
    template_name = "stepwisemain/user_universe_list.html"
    ordering = ["-update_date"]
    paginate_by = 40

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["userid"] = pk=self.kwargs["userid"]
        context["username"] = get_user_model().objects.get(pk=self.kwargs["userid"]).username
        return context

    def get_queryset(self):
        if (self.request.user.is_authenticated):
            return super().get_queryset().filter(Q(owner_id=self.kwargs["userid"]) & (Q(is_shared=True) | Q(owner=self.request.user)))
        else:
            return super().get_queryset().filter(owner_id=self.kwargs["userid"], is_shared=True)

class UserGames(generic.ListView):
    model = GameState
    template_name = "stepwisemain/user_game_list.html"
    paginate_by = 40

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["userid"] = self.kwargs["userid"]
        context["username"] = get_user_model().objects.get(pk=self.kwargs["userid"]).username
        return context

    def get_queryset(self):
        return super().get_queryset().filter(user_id=self.kwargs["userid"])

class UserLikedUniverses(UserUniverses):
    model = Universe
    template_name = "stepwisemain/user_liked_list.html"
    ordering = ["-update_date"]
    paginate_by = 40

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["userid"] = self.kwargs["userid"]
        context["username"] = get_user_model().objects.get(pk=self.kwargs["userid"]).username
        return context

    def get_queryset(self):
        return super().get_queryset().filter(liked_by=self.kwargs["userid"], is_shared=True)

class UserProfile(generic.DetailView):
    model = get_user_model()
    template_name = "stepwisemain/user_profile.html"
    context_object_name = "profile_user"

    def post(self, request, **kwargs):
        if (request.user == self.get_object()):
            print(request.POST.get("about"))
            obj = self.get_object()
            obj.about = request.POST.get("about")
            obj.save()
        return redirect(request.path)

class ProjectList(generic.ListView):
    model = Universe
    template_name = "stepwisemain/universe_list.html"
    header = "Oldest projects"
    paginate_by = 40

    def get_queryset(self):
        queryset = super().get_queryset().filter(is_shared=True)
        query = self.request.GET.get('q', '')
        
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) | Q(description__icontains=query) | Q(owner__username=query)
            )
            
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["header"] = self.header
        return context

class RecentProjects(ProjectList):
    ordering = ["-update_date"]
    header = "Recently updated projects"

class MostPlayedProjects(ProjectList):
    ordering = ["-plays", "-update_date"]
    header = "Most played projects"

class MostLikedProjects(ProjectList):
    ordering = ["-likes", "-update_date"]
    header = "Most liked projects"

class ReportBugsView(generic.CreateView):
    model = BugReport
    form_class = BugReportForm
    template_name = "stepwisemain/suggestions.html"
    success_url = reverse_lazy("stepwisemain:index")

class MakeSuggestionView(generic.CreateView):
    model = Suggestion
    form_class = SuggestionForm
    template_name = "stepwisemain/suggestions.html"
    success_url = reverse_lazy("stepwisemain:index")