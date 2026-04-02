const dotenv = require("dotenv");
const app = require("../src/app");
const connectDB = require("../src/config/db");

dotenv.config();

let databaseConnection;

const ensureDatabaseConnection = async () => {
	if (!databaseConnection) {
		databaseConnection = connectDB();
	}

	await databaseConnection;
};

module.exports = async (req, res) => {
	await ensureDatabaseConnection();
	return app(req, res);
};
