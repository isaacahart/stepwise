from django.test import TestCase
from ..models import Proposition, Universe, Level, Theorem, Axiom, sort_theorems_by_category

class TheoremTest(TestCase):
    def setUp(self):
        Proposition.objects.create(name="thm1")
        Proposition.objects.create(name="thm2", statement={"type": "simple",
                                                       "data": {"relation": "",
                                                                "objects": []}})

    def test_init(self):
        thm1 = Proposition.objects.get(id=1)
        #self.assertEqual(thm1.statement, None)
        self.assertEqual(thm1.name, "thm1")
        self.assertEqual(thm1._meta.get_field("name").max_length, 100)
        self.assertEqual(thm1.color, "#000000")
        self.assertEqual(thm1._meta.get_field("color").max_length, 7)

    def test_str(self):
        thm1 = Proposition.objects.get(name="thm1")
        thm2 = Proposition.objects.get(name="thm2")
        self.assertEqual(str(thm1), "thm1")
        self.assertEqual(str(thm2), "thm2")


class UniverseTest(TestCase):
    def setUp(self):
        Universe.objects.create(name="unv1", edges=[{"from":1, "to":2}, {"from":2, "to":3}, {"from":2, "to":4}, {"from":3, "to":5}, {"from":4, "to":5}, {"from":3, "to":6}, {"from":6, "to":3}])
        unv = Universe.objects.get(name="unv1")
        Level.objects.create(name="lvl1", universe=unv)
        Level.objects.create(name="lvl2", universe=unv)
        Level.objects.create(name="lvl3", universe=unv)
        Level.objects.create(name="lvl4", universe=unv)
        Level.objects.create(name="lvl5", universe=unv)
        Level.objects.create(name="lvl6", universe=unv)
        Theorem.objects.create(name="thm1", level=Level.objects.get(name="lvl1"))
        Theorem.objects.create(name="thm2", level=Level.objects.get(name="lvl2"))
        Theorem.objects.create(name="thm3", level=Level.objects.get(name="lvl3"))
        Theorem.objects.create(name="thm4", level=Level.objects.get(name="lvl4"))
        Theorem.objects.create(name="thm5", level=Level.objects.get(name="lvl5"))
        Theorem.objects.create(name="thm6", level=Level.objects.get(name="lvl6"))
        Axiom.objects.create(name="ax1a", level=Level.objects.get(name="lvl1"))
        Axiom.objects.create(name="ax3a", level=Level.objects.get(name="lvl3"))
        Axiom.objects.create(name="ax4a", level=Level.objects.get(name="lvl4"))

    def test_get_levels_before(self):
        unv = Universe.objects.get(name="unv1")
        self.assertEqual(unv.get_levels_before(1, []), [])
        self.assertEqual(unv.get_levels_before(2, []), [1])
        self.assertEqual(unv.get_levels_before(3, []), [2,1,6,3])
        self.assertEqual(unv.get_levels_before(4, []), [2,1])
        self.assertEqual(unv.get_levels_before(5, []), [3,2,1,6,4])
        self.assertEqual(unv.get_levels_before(6, []), [3,2,1,6])

    def test_theorems_in_levels(self):
        thm1 = Theorem.objects.get(name="thm1")
        thm2 = Theorem.objects.get(name="thm2")
        thm3 = Theorem.objects.get(name="thm3")
        thm4 = Theorem.objects.get(name="thm4")
        thm5 = Theorem.objects.get(name="thm5")
        thm6 = Theorem.objects.get(name="thm6")
        ax1a = Axiom.objects.get(name="ax1a")
        ax3a = Axiom.objects.get(name="ax3a")
        ax4a = Axiom.objects.get(name="ax4a")
        unv = Universe.objects.get(name="unv1")
        self.assertEqual(unv.theorems_in_levels([]), [])
        self.assertEqual(unv.theorems_in_levels([4, 2]), [thm2, ax4a, thm4])
        self.assertEqual(unv.theorems_in_levels([1, 3, 5]), [thm5, ax3a, thm3, ax1a, thm1])

    def test_unlocked_levels(self):
        unv = Universe.objects.get(name="unv1")
        self.assertEqual(unv.get_unlocked_levels([]), [1])
        self.assertEqual(unv.get_unlocked_levels([1,2]), [1,2,4])
        self.assertEqual(unv.get_unlocked_levels([1,2,6]), [1,2,3,4])
        self.assertEqual(unv.get_unlocked_levels([1,2,3,4,6]), [1,2,3,4,5,6])

    def test_delete_edges_on_level_delete(self):
        unv = Universe.objects.get(name="unv1")
        unv.delete_edges_on_level_delete(3)
        self.assertEqual(unv.edges, [{"from":1, "to":2}, {"from":2, "to":4}, {"from":4, "to":5}])


class TheoremCategoryTest(TestCase):
    def setUp(self):
            Universe.objects.create(name="unv1")
            unv = Universe.objects.get(name="unv1")
            Level.objects.create(name="lvl1", universe=unv)
            Level.objects.create(name="lvl2", universe=unv)
            Level.objects.create(name="lvl3", universe=unv)
            Level.objects.create(name="lvl4", universe=unv)
            Level.objects.create(name="lvl5", universe=unv)
            Level.objects.create(name="lvl6", universe=unv)
            Theorem.objects.create(name="thm1", category="1", level=Level.objects.get(name="lvl1"))
            Theorem.objects.create(name="thm2", category="2", level=Level.objects.get(name="lvl2"))
            Theorem.objects.create(name="thm3", category="1", level=Level.objects.get(name="lvl3"))
            Theorem.objects.create(name="thm4", category="3", level=Level.objects.get(name="lvl4"))
            Theorem.objects.create(name="thm5", category="3", level=Level.objects.get(name="lvl5"))
            Theorem.objects.create(name="thm6", category="1", level=Level.objects.get(name="lvl6"))
            Axiom.objects.create(name="ax1a", level=Level.objects.get(name="lvl1"))
            Axiom.objects.create(name="ax3a", level=Level.objects.get(name="lvl3"))
            Axiom.objects.create(name="ax4a", level=Level.objects.get(name="lvl4"))
    
    def test_sort_theorems_into_categories(self):
        thm1 = Theorem.objects.get(name="thm1")
        thm2 = Theorem.objects.get(name="thm2")
        thm3 = Theorem.objects.get(name="thm3")
        thm4 = Theorem.objects.get(name="thm4")
        thm5 = Theorem.objects.get(name="thm5")
        thm6 = Theorem.objects.get(name="thm6")
        self.assertEqual(sort_theorems_by_category([]), {})
        self.assertEqual(sort_theorems_by_category([thm1, thm2, thm3, thm4, thm5, thm6]), {"1":[thm1, thm3, thm6], "2":[thm2], "3":[thm4, thm5]})