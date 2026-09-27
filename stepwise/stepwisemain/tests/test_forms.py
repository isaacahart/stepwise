from django.test import TestCase
from ..forms import statement_valid

class StatementValidTest(TestCase):
    def test_not_a_dict_is_invalid(self):
        self.assertFalse(statement_valid('hello world'))
        self.assertFalse(statement_valid([{'type':'simple', 'relation':'', 'objects':[]}]))

    def test_no_type_is_invalid(self):
        self.assertFalse(statement_valid({}))
        self.assertFalse(statement_valid({'type ':'simple', 'relation':'', 'objects':[]}))

    def test_invalid_type(self):
        self.assertFalse(statement_valid({'type':'foobar', 'relation':'', 'objects':[]}))
        self.assertFalse(statement_valid({'type':67, 'relation':'67', 'objects':[67]}))

    def test_simple_valid(self):
        self.assertTrue(statement_valid({'type':'simple', 'relation':'asdf', 'objects':[]}))
        self.assertTrue(statement_valid({'type':'simple', 'relation':'asdf', 'objects':[2, 7, 0]}))

    def test_simple_invalid(self):
        self.assertFalse(statement_valid({'type':'simple', 'relation':'asdf', 'objects':'foobar'}))
        self.assertFalse(statement_valid({'type':'simple', 'relation':'asdf', 'objects':['foo', 'bar']}))
        self.assertFalse(statement_valid({'type':'simple', 'relation':[], 'objects':[1,2,3]}))
        self.assertFalse(statement_valid({'type':'simple', 'relation':1234, 'objects':[1,2,3]}))
        self.assertFalse(statement_valid({'type':'simple', 'relation ':'asdf', 'objects':[2, 7, 0]}))
        self.assertFalse(statement_valid({'type':'simple', 'relation':'asdf', 'objects ':[2, 7, 0]}))

    def test_not_valid(self):
        self.assertTrue(statement_valid({'type':'not', 'statement':{'type':'simple', 'relation':'', 'objects':[]}}))

    def test_not_invalid(self):
        self.assertFalse(statement_valid({'type':'not', 'statement ':{'type':'simple', 'relation':'', 'objects':[]}}))
        self.assertFalse(statement_valid({'type':'not', 'statement':{'type':'simple', 'relation':'', 'objects':'bob'}}))
        self.assertFalse(statement_valid({'type':'not', 'statement':'foobar'}))

    def test_and_or_valid(self):
        self.assertTrue(statement_valid({'type':'and', 'statements':[]}))
        self.assertTrue(statement_valid({'type':'or', 'statements':[
            {'type':'simple', 'relation':'foo', 'objects':[]}, {'type':'simple', 'relation':'bar', 'objects':[2, 7, 0]}]}))

    def test_and_or_invalid(self):
        self.assertFalse(statement_valid({'type':'and', 'statement':[]}))
        self.assertFalse(statement_valid({'type':'or', 'statements':{}}))
        self.assertFalse(statement_valid({'type':'and', 'statements':[{'type':'simple', 'relation':'', 'objects':[]}, {'type':'foobar'}]}))

    def test_if_valid(self):
        self.assertTrue(statement_valid({'type':'implication', 'first':{'type':'simple', 'relation':'', 'objects':[]}, 'second':{'type':'simple', 'relation':'', 'objects':[]}}))
        self.assertTrue(statement_valid({'type':'equivalence', 'first':{'type':'simple', 'relation':'', 'objects':[]}, 'second':{'type':'simple', 'relation':'', 'objects':[]}}))

    def test_if_invalid(self):
        self.assertFalse(statement_valid({'type':'implication', 'firstt':{'type':'simple', 'relation':'', 'objects':[]}, 'second':{'type':'simple', 'relation':'', 'objects':[]}}))
        self.assertFalse(statement_valid({'type':'implication', 'firstt':{'type':'simple', 'relation':'', 'objects':[]}, 'ssecond':{'type':'simple', 'relation':'', 'objects':[]}}))
        self.assertFalse(statement_valid({'type':'implication', 'first':{'type':'foobar'}, 'second':{'type':'simple', 'relation':'', 'objects':[]}}))
        self.assertFalse(statement_valid({'type':'implication', 'first':{'type':'simple', 'relation':'', 'objects':[]}, 'second':{'type':'foobar'}}))
        self.assertFalse(statement_valid({'type':'implication', 'first':{'type':'simple', 'relation':'', 'objects':[]}, 'second':'hello world'}))

    def test_quantifier_valid(self):
        self.assertTrue(statement_valid({'type':'for-all', 'varName':'x', 'varColor':'#123456', 'statement':{'type':'simple', 'relation':'', 'objects':[]}}))

    def test_quantifier_invalid(self):
        self.assertFalse(statement_valid({'type':'for-all', 'varName':1, 'varColor':'#123456', 'statement':{'type':'simple', 'relation':'', 'objects':[]}}))
        self.assertFalse(statement_valid({'type':'for-all', 'varName':'x', 'varColor':['#123456'], 'statement':{'type':'simple', 'relation':'', 'objects':[]}}))
        self.assertFalse(statement_valid({'type':'for-all', 'varNam':'x', 'varColor':'#123456', 'statement':{'type':'simple', 'relation':'', 'objects':[]}}))
        self.assertFalse(statement_valid({'type':'for-all', 'varName':'x', 'varColor':'#123456', 'sta':{'type':'simple', 'relation':'', 'objects':[]}}))
        self.assertFalse(statement_valid({'type':'for-all', 'varName':'x', 'varColor':'#123456', 'statement':{'type':'foobar'}}))

    def test_schema_valid(self):
        self.assertTrue(statement_valid({'type':'axiom-schema', 'staName':'s1', 'freeVars':2, 'statement':{'type':'simple', 'relation':'', 'objects':[]}}))

    def test_schema_invalid(self):
        self.assertFalse(statement_valid({'type':'axiom-schema', 'staName':1234, 'freeVars':2, 'statement':{'type':'simple', 'relation':'', 'objects':[]}}))
        self.assertFalse(statement_valid({'type':'axiom-schema', 'staName':'s1', 'freeVar':2, 'statement':{'type':'simple', 'relation':'', 'objects':[]}}))
        self.assertFalse(statement_valid({'type':'axiom-schema', 'staName':'s1', 'freeVars':2, 'statement':{'type':'foobar'}}))

    def test_statement_app_valid(self):
        self.assertTrue(statement_valid({'type':'statement-app', 'staIdx':1, 'inputVars':[]}))
        self.assertTrue(statement_valid({'type':'statement-app', 'staIdx':1, 'inputVars':[5,3,1]}))

    def test_statement_app_invalid(self):
        self.assertFalse(statement_valid({'type':'statement-app', 'statementIdx':1, 'inputVars':[5,3,1]}))
        self.assertFalse(statement_valid({'type':'statement-app', 'staIdx':1, 'inputVar':[]}))
        self.assertFalse(statement_valid({'type':'statement-app', 'staIdx':1, 'inputVars':[5, 'three', 1]}))

