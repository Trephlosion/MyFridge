import {zodResolver} from "@hookform/resolvers/zod"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {useForm} from "react-hook-form";
import {SigninValidation} from "@/lib/validation";
import {z} from "zod";
import {useSignInAccount} from "@/lib/react-query/queriesAndMutations.ts";
import {Link} from "react-router-dom";
import Loader from "@/components/shared/Loader.tsx";
import {checkAuthUser, signInAccount} from "@/lib/firebase/api.ts";


const SigninForm = () => {
    // 1. Define your form.

    const form = useForm({
        resolver: zodResolver(SigninValidation),
        defaultValues: {
            email: "",
            password: "",
        },
    });



    async function onSubmit(values: z.infer<typeof SigninValidation>) {
        try {


            // Step 2: Sign in the new user
            const session = await signInAccount({
                email: values.email,
                password: values.password,
            });

            if (!session) {
                toast({title: "Something went wrong. Please log in to your new account."})
                navigate("/sign-in");
                return;
            }

            // Step 3: Check authentication state
            const isLoggedIn = await checkAuthUser();
            if (isLoggedIn) {
                form.reset();
                navigate("/");
                toast({title: "Account created successfully! Welcome!"})
            } else {
                toast({title: "Login failed. Please try again."})
            }
        } catch (error) {
            console.error("Error signing in user", error)
            toast({title: "Sign In Failed, Please try again"})
        }
    }


    return (
        <Form {...form}>
            <div className="sm:w-420 flex-center flex-col">
                {/*Logo*/}
                <img src="/assets/images/logo.svg" alt="Logo"/>

                <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Sign Into MyKitchen</h2>
                <p className="text-light-3 small-medium md:base-regular mt-2">Welcome Back To MyKitchen!</p>

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">

                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" className="shad-input" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" className="shad-input" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="shad-button_primary">
                        {isUserLoading ? (
                            <div className="flex-center gap-2">
                                <Loader/> Loading...
                            </div>
                        ) : "Log In"}
                    </Button>

                    <p className="text-small-regular text-light-2 text-center mt-2">
                        Don't have an account?
                        <Link to="/sign-up" className="text-primary-500 text-small-semibold ml-1">
                            Sign Up
                        </Link>
                    </p>
                </form>
            </div>
        </Form>
    )
}
export default SigninForm
