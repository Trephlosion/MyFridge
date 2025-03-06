import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // ✅ Import React Query

// ✅ Create a QueryClient instance
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>  {/* ✅ Wrap with QueryClientProvider */}
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </QueryClientProvider>
);

