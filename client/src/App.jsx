import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import AuthBootstrap from "./components/auth/AuthBootstrap";

const App = () => {
	return (
		<BrowserRouter>
			<AuthBootstrap>
				<AppRoutes />
			</AuthBootstrap>
			<Toaster
				position="top-right"
				toastOptions={{
					style: {
						borderRadius: "12px",
						background: "#0f172a",
						color: "#fff",
					},
				}}
			/>
		</BrowserRouter>
	);
};

export default App;
