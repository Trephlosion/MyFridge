import {Routes, Route } from 'react-router-dom';

import './globals.css';
import AuthLayout from './_auth/AuthLayout';
import RootLayout from './_root/RootLayout';
import SignupForm from './_auth/forms/SignupForm.tsx';
import SigninForm from './_auth/forms/SigninForm.tsx';
import {Home,Explore, Saved, AllUsers, EditRecipe, RecipeDetails, CreateRecipe, Profile, UpdateProfile, LikedRecipes} from './_root/pages';
import {Toaster} from "@/components/ui/toaster.tsx";

const App = () => {
        return(
            <main className="flex h-screen">
                <Routes>
                    {/* public routes */}
                    <Route element={<AuthLayout />}>
                        <Route path="/sign-in" element={<SigninForm />} />
                        <Route path="/sign-up" element={<SignupForm />} />
                    </Route>
                    {/* private routes */}
                    <Route element={<RootLayout />}>
                        <Route index element={<Home/>}/>
                        <Route path={"/explore"} element={<Explore />} />
                        <Route path={"/saved"}   element={<Saved />} />
                        <Route path={"/all-users"} element={<AllUsers />} />
                        <Route path={"/create-recipe"} element={<CreateRecipe />} />
                        <Route path={"/update-recipe/:id"} element={<EditRecipe />} />
                        <Route path={"/recipe/:id"} element={<RecipeDetails />} />
                        <Route path={"/profile/:id"} element={<Profile />} />
                        <Route path={"/update-profile/:id"} element={<UpdateProfile />} />
                    </Route>
                </Routes>
                <Toaster/>
            </main>
        )
}

export default App
