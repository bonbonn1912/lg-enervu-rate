import mysql from 'mysql2/promise';
import 'dotenv/config'

const connectToDatabase = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            port:process.env.DB_PORT,
            password: process.env.DB_PASSWORD,
            database: 'home-dashboard'
        });
        console.log("Successfully connected to the database.");
        return connection;
    } catch (error) {
        console.error("Error connecting to the database:", error);
        throw error;
    }
};

const insertData = async (data, date) => {
    console.log(date);

    const totalGridESell = data["totalGridESell"] // Netzeinspeisung
    const totalDirectConsumpE = data["totalDirectConsumpE"] // Direkter Verbrauch
    const totalBattChg = data["totalBattChg"] // Aufladen
    const totalGridEBuy = data["totalGridEBuy"] // Gekauft
    const totalPvE = data["totalPvE"] // PV Erzeugung
    const totalBattDis = data["totalBattDis"] // Batterie Entladung
    const totalConsumpE = data["totalConsumpE"] // Verbrauch

    const percentageSelfProduced = ((1 - (totalGridEBuy / totalConsumpE)).toFixed(2) * 100);
    const ownUse = totalDirectConsumpE + totalBattChg;
    const percentageSelfUsed = ((ownUse / totalPvE).toFixed(2) * 100);


    try {
        const db = await connectToDatabase();

        const [existingEntry] = await db.query(
            `SELECT id FROM enervu_energy_data WHERE date = ?`,
            [date]
        );

        if (existingEntry.length > 0) {
            // Update existing entry
            await db.query(
                `UPDATE enervu_energy_data SET 
                    totalGridESell = ?, 
                    totalDirectConsumpE = ?, 
                    totalBattChg = ?, 
                    totalGridEBuy = ?, 
                    totalPvE = ?, 
                    totalBattDis = ?, 
                    totalConsumpE = ?, 
                    updatedAt = CURRENT_TIMESTAMP
                WHERE date = ?`,
                [
                    totalGridESell,
                    totalDirectConsumpE,
                    totalBattChg,
                    totalGridEBuy,
                    totalPvE,
                    totalBattDis,
                    totalConsumpE,
                    date
                ]
            );
        } else {
            await db.query(
                `INSERT INTO enervu_energy_data (
                    date, 
                    totalGridESell, 
                    totalDirectConsumpE, 
                    totalBattChg, 
                    totalGridEBuy, 
                    totalPvE, 
                    totalBattDis, 
                    totalConsumpE
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    date,
                    totalGridESell,
                    totalDirectConsumpE,
                    totalBattChg,
                    totalGridEBuy,
                    totalPvE,
                    totalBattDis,
                    totalConsumpE
                ]
            );
        }

        console.log("Data successfully inserted/updated.");
        await db.end();
    } catch (error) {
        console.error("Error inserting/updating data:", error);
    }
};

export {
    insertData
};
