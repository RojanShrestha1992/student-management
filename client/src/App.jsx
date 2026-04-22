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
						background: "#13263d",
						color: "#fff",
					},
					success: {
						style: {
							background: "#0b8a6c",
						},
					},
					error: {
						style: {
							background: "#c43e67",
						},
					},
				}}
			/>
		</BrowserRouter>
	);
};

export default App;
