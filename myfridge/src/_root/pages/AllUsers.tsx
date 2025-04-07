import { useEffect, useState } from "react";
          import { collection, getDocs, doc, getDoc } from "firebase/firestore";
          import { database } from "@/lib/firebase/config";
          import { useUserContext } from "@/context/AuthContext";
          import { useNavigate } from "react-router-dom";
          import { useToast } from "@/hooks/use-toast";
          import { Loader, UserCard, BaseLoading } from "@/components/shared";
          import { IUser } from "@/types";
import {Button} from "@/components/ui/button.tsx";
import {  useCreateUserAccount } from "@/lib/react-query/queriesAndMutations";


// TODO: CHANGE USER CARD COLORS DEPENDING ON IF USER IS BANNED/DEACTIVATED


          const AllUsers = () => {
            const navigate = useNavigate();
            const { toast } = useToast();
            const { user } = useUserContext();
            const [creators, setCreators] = useState<IUser[]>([]);
            const [isLoading, setIsLoading] = useState<boolean>(true);
            const [isError, setIsError] = useState<boolean>(false);
            const [isAdmin, setIsAdmin] = useState(false);
            const {mutateAsync: createUserAccount, isPending: isCreatingUser} = useCreateUserAccount()

            /*// Check if the logged-in user is an admin
            useEffect(() => {
              const checkAdmin = async () => {
                if (!user) return;
                try {
                  const userDoc = await getDoc(doc(database, "Users", user.id));
                  if (userDoc.exists() && userDoc.data().isAdministrator === true) {
                    setIsAdmin(true);
                  }
                } catch (error) {
                  console.error("Error checking admin status:", error);
                }
              };
              checkAdmin();
            }, [user]);*/

            // Fetch all users from Firestore
            const fetchUsers = async () => {
              setIsLoading(true);
              setIsError(false);
              try {
                const usersCollection = collection(database, "Users");
                const snapshot = await getDocs(usersCollection);
                const users = snapshot.docs.map((doc) => {
                  const data = doc.data() as IUser;
                  return { id: doc.id, ...data };
                });
                setCreators(users);
              } catch (error) {
                console.error("Error fetching users:", error);
                setIsError(true);
                toast({ title: "Something went wrong while fetching users." });
              } finally {
                // Simulate loading state for 3 seconds
                await new Promise((resolve) => setTimeout(resolve, 3000));
                setIsLoading(false);
              }
            };

            const handleCreateTestUsers = async () => {
              const dummyPassword = "Test1234!";
              const testUsers = [];

              // 5 Admin test users (isAdministrator true)
              for (let i = 1; i <= 5; i++) {
                testUsers.push({
                  username: `Admin_Test_${i}`,
                  email: `admin${i}@example.com`,
                  password: dummyPassword,
                  isAdministrator: true,
                  isVerified: false,
                  isCurator: false,
                });
              }
              // 5 Content Creator test users (isVerified true)
              for (let i = 1; i <= 5; i++) {
                testUsers.push({
                  username: `ContentCreator_Test_${i}`,
                  email: `contentcreator${i}@example.com`,
                  password: dummyPassword,
                  isAdministrator: false,
                  isVerified: true,
                  isCurator: false,
                });
              }
              // 5 Recipe Curator test users (isCurator true)
              for (let i = 1; i <= 5; i++) {
                testUsers.push({
                  username: `RecipeCurator_Test_${i}`,
                  email: `recipecurator${i}@example.com`,
                  password: dummyPassword,
                  isAdministrator: false,
                  isVerified: false,
                  isCurator: true,
                });
              }
              // 5 Regular User test users (all flags false)
              for (let i = 1; i <= 5; i++) {
                testUsers.push({
                  username: `Regular_Test_${i}`,
                  email: `regular${i}@example.com`,
                  password: dummyPassword,
                  isAdministrator: false,
                  isVerified: false,
                  isCurator: false,
                });
              }

              try {
                for (const userData of testUsers) {
                  await createUserAccount(userData);
                }
                console.log("Test users created successfully");
              } catch (error) {
                console.error("Error creating test users", error);
              }
            };

            useEffect(() => {
              fetchUsers();
            }, []);

            if (isError) {
              toast({ title: "Something went wrong." });
              return null;
            }

            return (
                <div className="common-container">
                  <div className="user-container">
                    <div className="flex justify-between items-center">
                    {/* Page Title */}
                    <h2 className="h3-bold md:h2-bold text-left w-full ">
                      {isAdmin ? "All Users - Admin View" : "All Users"}
                    </h2>
                      {(user?.isAdministrator || user?.isVerified) && (
                          <>
                            {user?.isVerified && (
                                <p className="text-sm align-middle text-green-600"> Creator View</p>
                            )}

                          </>
                      )}
                      {user?.isAdministrator && (
                          <Button
                              onClick={handleCreateTestUsers}
                              className="p-2 bg-green-500 text-white rounded-md mt-2"
                          >
                            Create Test Users
                          </Button>
                      )}
                    </div>
                    {isLoading ? (
                        <BaseLoading />
                    ) : (
                        <ul className="user-grid">
                          {creators.map((creator) => (
                              <li key={creator.id} className="flex-1 min-w-[200px] w-full">
                                <UserCard user={creator} />
                              </li>
                          ))}
                        </ul>
                    )}
                  </div>
                </div>
            );
          };

          export default AllUsers;
