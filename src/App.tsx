import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Exercises from "./pages/Exercises";
import ExerciseDetail from "./pages/ExerciseDetail";
import FoodTracker from "./pages/FoodTracker";
import FoodPlan from "./pages/FoodPlan";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="exercises" element={<Exercises />} />
        <Route path="exercises/:slug" element={<ExerciseDetail />} />
        <Route path="food" element={<FoodTracker />} />
        <Route path="food/plan" element={<FoodPlan />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
