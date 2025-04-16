import { Routes, Route } from 'react-router-dom';
                    import { useUserContext } from '@/context/AuthContext';
                    import './globals.css';
                    import AuthLayout from './_auth/AuthLayout';
                    import RootLayout from './_root/RootLayout';
                    import SignupForm from './_auth/forms/SignupForm.tsx';
                    import SigninForm from './_auth/forms/SigninForm.tsx';
                    import { Home, Explore, Saved, AllUsers, EditRecipe, RecipeDetails, CreateRecipe, Profile, UpdateProfile, LikedRecipes, Admin, Workshops } from './_root/pages';
                    import { Toaster } from '@/components/ui/toaster.tsx';
                    import RecipeAnalytics from './_root/pages/RecipeAnalytics.tsx';
                    import SendMessage from "@/_root/pages/SendMessage.tsx";
                    import {Inbox} from "lucide-react";



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
                                        <Route path="/update-recipe/:id/*" element={<EditRecipe />} />
                                        <Route path="/recipe/:id/*" element={<RecipeDetails />} />
                                        <Route path="/profile/:id/*" element={<Profile />} />
                                        <Route path="/recipes/:id/*" element={<RecipeDetails />} />
                                        <Route path="/update-profile/:id/*" element={<UpdateProfile />} />
                                        <Route path="/liked-recipes/:id/*" element={<LikedRecipes />} />
                                        <Route path="/admin" element={<Admin />} />
                                        <Route path="/workshops/*" element={<Workshops />} />
                                        <Route path="/recipe-analytics" element={<RecipeAnalytics />} />
                                        <Route path="/send-message/:userId" element={<SendMessage />} />
                                        <Route path="/inbox" element={<Inbox />} />




                                    </Route>
                                </Routes>
                                <Toaster />
                            </main>
                        );
                    };

                    export default App;
