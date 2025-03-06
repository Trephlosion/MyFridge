import { Button } from "@/components/ui/button"
import { z } from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {SignupValidation} from "@/lib/validation";
import { useForm } from "react-hook-form";
import {Link} from "react-router-dom";
import Loader from "@/components/shared/Loader.tsx";



const SignupForm = () => {
    const isCreatingUser = false;
    // 1. Define your form.
    const form = useForm({
        resolver: zodResolver(SignupValidation),
        defaultValues: {
            first_name: "",
            last_name: "",
            username: "",
            email: "",
            password: "",
        },
    });

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof SignupValidation>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values);
    }

    return (
        <div>
            <Form {...form}>
                <div className="sm:w-420 flex-center flex-col">
                    {/*Logo*/}
                    <img src="/assets/images/logo.svg" alt="Logo"/>

                    <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Create an account</h2>
                    <p className="text-light-3 small-medium md:base-regular mt-2">Create your profile to use MyKitchen</p>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input type="text" className="shad-input" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="last_name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input type="text" className="shad-input" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="username"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input type="text" className="shad-input" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

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
                            {isCreatingUser ? (
                                <div className="flex-center gap-2">
                                   <Loader/> Loading...
                                </div>
                            ) : "Create Account"}
                        </Button>

                        <p className="text-small-regular text-light-2 text-center mt-2">
                            Already have an account?
                            <Link to="/sign-in" className="text-primary-500 text-small-semibold ml-1">
                                Log in
                            </Link>
                        </p>
                    </form>
                </div>
            </Form>
        </div>
    );
};
export default SignupForm
