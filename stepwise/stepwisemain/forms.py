from django import forms
from .models import Proposition, Level, Universe, Axiom, Theorem, BugReport, Suggestion
import json
from django.core.exceptions import ValidationError

def statement_valid(sta):
    if type(sta) != dict:
        return False
    if "type" not in sta:
        return False
    if sta["type"] == "simple":
        return simple_statement_valid(sta)
    elif sta["type"] == "not":
        return not_statement_valid(sta)
    elif sta["type"] == "and" or sta["type"] == "or":
        return and_or_statement_valid(sta)
    elif sta["type"] == "implication" or sta["type"] == "equivalence":
        return if_statement_valid(sta)
    elif sta["type"] == "for-all" or sta["type"] == "exists":
        return quantifier_statement_valid(sta)
    elif sta["type"] == "axiom-schema":
        return axiom_schema_valid(sta)
    elif sta["type"] == "statement-app":
        return statement_app_valid(sta)
    else:
        return False

def simple_statement_valid(sta):
    if "relation" not in sta or "objects" not in sta:
        return False
    if type(sta["relation"]) != str:
        return False
    if type(sta["objects"]) != list:
        return False
    if any(type(x) != int for x in sta["objects"]):
        return False
    return True

def not_statement_valid(sta):
    if "statement" not in sta:
        return False
    return statement_valid(sta["statement"])

def and_or_statement_valid(sta):
    if "statements" not in sta:
        return False
    if type(sta["statements"]) != list:
        return False
    return all(statement_valid(s) for s in sta["statements"])

def if_statement_valid(sta):
    if "first" not in sta or "second" not in sta:
        return False
    return statement_valid(sta["first"]) and statement_valid(sta["second"])

def quantifier_statement_valid(sta):
    if "varName" not in sta or "varColor" not in sta or "statement" not in sta:
        return False
    if type(sta["varName"]) != str or type(sta["varColor"]) != str:
        return False
    if "varIdx" in sta and type(sta["varIdx"]) != int:
        return False
    return statement_valid(sta["statement"])

def axiom_schema_valid(sta):
    if "staName" not in sta or "freeVars" not in sta or "statement" not in sta:
        return False
    if type(sta["staName"]) != str or type(sta["freeVars"]) != int:
        return False
    return statement_valid(sta["statement"])

def statement_app_valid(sta):
    if "staIdx" not in sta or "inputVars" not in sta:
        return False
    if type(sta["staIdx"]) != int or type(sta["inputVars"]) != list:
        return False
    if any(type(x) != int for x in sta["inputVars"]):
        return False
    return True


def object_valid(obj):
    if type(obj) != dict:
        return False
    if "name" not in obj or "color" not in obj:
        return False
    if type(obj["name"]) != str or type(obj["color"]) != str:
        return False
    return True


def block_valid(block):
    if type(block) != dict:
        return False
    if "type" not in block:
        return False
    if block["type"] == "theorem-app":
        return theorem_app_valid(block)
    elif block["type"] == "for-all-block":
        return for_all_block_valid(block)
    elif block["type"] == "complete-goal":
        return complete_goal_valid(block)
    elif block["type"] == "tautology":
        return tautology_block_valid(block)
    elif block["type"] == "modus-ponens":
        return modus_ponens_block_valid(block)
    elif block["type"] == "prove-if":
        return prove_if_valid(block)
    elif block["type"] == "close-c-block":
        return close_c_block_valid(block)
    elif block["type"] == "prove-for-all":
        return prove_for_all_valid(block)
    elif block["type"] == "prove-exists":
        return prove_exists_valid(block)
    elif block["type"] == "reflexive-equality":
        return reflexivity_block_valid(block)
    elif block["type"] == "substitute":
        return substitute_block_valid(block)
    elif block["type"] == "proof-by-contradiction":
        return proof_by_contradiction_valid(block)
    elif block["type"] == "exists-definition":
        return exists_definition_block_valid(block)
    elif block["type"] == "find-contradiction":
        return find_contradiction_block_valid(block)
    else:
        return False

def outputs_valid(block):
    if "outputObjs" not in block or "outputBlocks" not in block:
        return False
    if type(block["outputObjs"]) != list or type(block["outputBlocks"]) != list:
        return False
    if any(not object_valid(x) for x in block["outputObjs"]) or any(not object_valid(x) for x in block["outputBlocks"]):
        return False
    return True

def theorem_app_valid(block):
    if "theorem" not in block or "inputs" not in block or "statementInputs" not in block or "boundVariables" not in block:
        return False
    if type(block["theorem"]) != int or type(block["inputs"]) != list or type(block["statementInputs"]) != list or type(block["boundVariables"]) != list:
        return False
    if any(type(x) != int for x in block["inputs"]):
        return False
    if any(type(x) != list for x in block["boundVariables"]):
        return False
    if not outputs_valid(block):
        return False
    if any(not statement_valid(x) for x in block["statementInputs"]):
        return False
    return True

def for_all_block_valid(block):
    if "id" not in block or "inputs" not in block:
        return False
    if type(block["id"]) != int or type(block["inputs"]) != list:
        return False
    if any(type(x) != int for x in block["inputs"]):
        return False
    if not outputs_valid(block):
        return False
    return True

def complete_goal_valid(block):
    if "inputs" not in block or "successful" not in block:
        return False
    if type(block["inputs"]) != list or type(block["successful"]) != bool:
        return False
    if any(type(x) != int for x in block["inputs"]):
        return False
    return True

def tautology_block_valid(block):
    if "statement" not in block:
        return False
    if not outputs_valid(block):
        return False
    if not statement_valid(block["statement"]):
        return False
    return True

def modus_ponens_block_valid(block):
    if "sta1" not in block or "sta2" not in block:
        return False
    if not outputs_valid(block):
        return False
    if not statement_valid(block["sta1"]) or not statement_valid(block["sta2"]):
        return False
    return True

def prove_if_valid(block):
    if "sta1" not in block or "sta2" not in block:
        return False
    if not outputs_valid(block):
        return False
    if not statement_valid(block["sta1"]) or not statement_valid(block["sta2"]):
        return False
    return True

def close_c_block_valid(block):
    if not outputs_valid(block):
        return False
    return True

def prove_for_all_valid(block):
    if "statement" not in block or "var" not in block:
        return False
    if not outputs_valid(block):
        return False
    if not object_valid(block["var"]) or not statement_valid(block["statement"]):
        return False
    return True

def prove_exists_valid(block):
    if "statement" not in block or "var" not in block or "inputs" not in block:
        return False
    if type(block["inputs"]) != list and len(block["inputs"]) != 1:
        return False
    if type(block["inputs"][0]) != int:
        return False
    if not object_valid(block["var"]) or not statement_valid(block["statement"]):
        return False
    return True

def reflexivity_block_valid(block):
    if "inputs" not in block:
        return False
    if type(block["inputs"]) != list and len(block["inputs"]) != 1:
        return False
    if type(block["inputs"][0]) != int:
        return False
    return True

def substitute_block_valid(block):
    if "statement" not in block or "inputs" not in block:
        return False
    if type(block["inputs"]) != list or len(block["inputs"]) != 2:
        return False
    if type(block["inputs"][0]) != int or type(block["inputs"][1]) != int:
        return False
    if not outputs_valid(block):
        return False
    if not statement_valid(block["statement"]):
        return False
    return True

def proof_by_contradiction_valid(block):
    if "statement" not in block:
        return False
    if not outputs_valid(block):
        return False
    if not statement_valid(block["statement"]):
        return False
    return True

def exists_definition_block_valid(block):
    if "statement" not in block:
        return False
    if not outputs_valid(block):
        return False
    if not statement_valid(block["statement"]):
        return False
    return True

def find_contradiction_block_valid(block):
    if "statement" not in block or "successful" not in block:
        return False
    if type(block["successful"]) != bool:
        return False
    if not statement_valid(block["statement"]):
        return False
    return True


def block_list_valid(blocks):
    if type(blocks) != list:
        return False
    return all(block_valid(blk) for blk in blocks)


def edge_valid(edge):
    if type(edge) != dict:
        return False
    if "from" not in edge or "to" not in edge:
        return False
    if type(edge["from"]) != int or type(edge["to"]) != int:
        return False
    return True


def edge_list_valid(edges):
    if type(edges) != list:
        return False
    return all(edge_valid(edge) for edge in edges)

        
class PropositionForm(forms.ModelForm):
    class Meta:
        model = Proposition
        fields = ["name", "color", "category", "statement"]
        widgets = {
            "color": forms.ColorInput(),
            "statement": forms.HiddenInput()
        }

    def clean_statement(self):
        data = self.cleaned_data["statement"]
        if not statement_valid(data):
            raise ValidationError("Statement is invalid.")
        return data

class TheoremForm(forms.ModelForm):
    class Meta:
        model = Theorem
        fields = ["name", "color", "category", "statement"]
        widgets = {
            "color": forms.ColorInput(),
            "statement": forms.HiddenInput()
        }

class AxiomForm(forms.ModelForm):
    class Meta:
        model = Axiom
        fields = ["name", "color", "category", "statement"]
        widgets = {
            "color": forms.ColorInput(),
            "statement": forms.HiddenInput()
        }

SPECIAL_BLOCKS = [
    ("complete-goal", "complete goal"),
    ("tautology", "establish tautology"),
    ("modus-ponens", "modus ponens"),
    ("prove-if", "prove if"),
    ("prove-for-all", "prove for all"),
    ("prove-exists", "prove there exists"),
    ("proof-by-contradiction", "proof by contradiction"),
    ("find-contradiction", "find contradiction"),
    ("exists-definition", "convert exists and for all"),
    ("reflexive-equality", "object equals itself"),
    ("substitute", "substitute equal objects")
]

class LevelForm(forms.ModelForm):
    new_special_blocks = forms.MultipleChoiceField(
        choices=SPECIAL_BLOCKS,
        widget=forms.CheckboxSelectMultiple,
        required=False
    )

    class Meta:
        model = Level
        fields = ["name", "color", "is_practice", "new_special_blocks", "help_text"]
        widgets = {
            "color": forms.ColorInput()
        }

class UniverseForm(forms.ModelForm):
    class Meta:
        model = Universe
        fields = ["name", "description", "is_shared", "edges"]
        widgets = {
            "edges": forms.HiddenInput()
        }

    def clean_edges(self):
        data = self.cleaned_data["edges"]
        if not edge_list_valid(data):
            raise ValidationError("The edges are not formatted correctly.")
        return data

class PlayLevelForm(forms.Form):
    proof_steps = forms.JSONField(widget=forms.HiddenInput, required=False)

    def clean_proof_steps(self):
        data = self.cleaned_data["proof_steps"]
        if not block_list_valid(data):
            raise ValidationError("The proof is not formatted correctly internally.")
        return data


class BugReportForm(forms.ModelForm):
    class Meta:
        model = BugReport
        fields = ["where_it_occurs", "description", "how_to_reproduce"]
        labels = {
            "where_it_occurs": "What page or screen does the bug occur on?",
            "description": "Describe the bug you are experiencing",
            "how_to_reproduce": "Describe in as much detail as possible how to reproduce the bug"
        }

class SuggestionForm(forms.ModelForm):
    class Meta:
        model = Suggestion
        fields = ["text"]
        labels = {
            "text": "Suggest a new feature or improvement. Suggestions for how to make Stepwise more approachable/accessible/easy to learn are especially appreciated.",
        }