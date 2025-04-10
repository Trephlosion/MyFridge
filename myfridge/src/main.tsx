import ReactDOM from 'react-dom/client';
import App from './App';
import {BrowserRouter} from 'react-router-dom';
import AuthProvider from "@/context/AuthContext.tsx";
import {QueryProvider} from "@/lib/react-query/QueryProvider.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(

        <BrowserRouter>
            <AuthProvider>


                <QueryProvider>

                    <App/>

                </QueryProvider>

            </AuthProvider>
        </BrowserRouter>

);
