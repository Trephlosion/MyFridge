import { Routes, Route } from 'react-router-dom';
                    import { useUserContext } from '@/context/AuthContext';
                    import './globals.css';
                    import AuthLayout from './_auth/AuthLayout';
                    import RootLayout from './_root/RootLayout';
                    import SignupForm from './_auth/forms/SignupForm.tsx';
                    import SigninForm from './_auth/forms/SigninForm.tsx';
                    import { Home, Explore, Saved, AllUsers, EditRecipe, RecipeDetails, CreateRecipe, Profile, UpdateProfile, LikedRecipes } from './_root/pages';
                    import Admin from './_root/pages/Admin'; // replace with actual Admin page component
                    import Workshops from './_root/pages/Workshops'; // replace with actual Workshops page component
                    import { Toaster } from '@/components/ui/toaster.tsx';

                    const App = () => {
                        const { user } = useUserContext();
                        return (
                            <main className="flex h-screen">
                                <Routes>
                                    {/* public routes */}
                                    <Route element={<AuthLayout />}>
                                        <Route path="/sign-in" element={<SigninForm />} />
                                        <Route path="/sign-up" element={<SignupForm />} />
                                    </Route>
                                    {/* private routes */}
                                    <Route element={<RootLayout />}>
                                        <Route index element={<Home />} />
                                        <Route path="/explore" element={<Explore />} />
                                        <Route path="/saved" element={<Saved />} />
                                        <Route path="/all-users" element={<AllUsers />} />
                                        <Route path="/create-recipe" element={<CreateRecipe />} />
                                        <Route path="/update-recipe/:id" element={<EditRecipe />} />
                                        <Route path="/recipe/:id" element={<RecipeDetails />} />
                                        <Route path="/profile/:id" element={<Profile />} />
                                        <Route path="/update-profile/:id" element={<UpdateProfile />} />
                                        <Route path="/liked-recipes/:id" element={<LikedRecipes />} />
                                        {(user?.isVerified || user?.isAdministrator) && (
                                            <>
                                                {user?.isAdministrator && (
                                                    <Route path="/admin" element={<Admin />} />
                                                )}
                                                {user?.isVerified && (
                                                    <Route path="/workshops" element={<Workshops />} />
                                                )}
                                            </>
                                        )}
                                    </Route>
                                </Routes>
                                <Toaster />
                            </main>
                        );
                    };

                    export default App;
