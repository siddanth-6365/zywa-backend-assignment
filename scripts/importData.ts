import { PrismaClient, EventType } from "@prisma/client";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { parse } from "date-fns";

const prisma = new PrismaClient();

async function importData() {
  try {
    await importPickupData();
    await importDeliveryExceptionData();
    await importDeliveredData();
    await importReturnedData();
  } catch (error) {
    console.error("Error importing data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function importPickupData() {
  const pickupsFile = path.join(__dirname, "../data/Pickup.csv");
  const pickups: any[] = [];

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(pickupsFile)
      .pipe(csv())
      .on("data", (row) => {
        pickups.push(row);
      })
      .on("end", async () => {
        try {
          for (const row of pickups) {
            const cardId = row["Card ID"];
            const userMobile = row["User Mobile"];
            const timestamp = parseDate(row["Timestamp"]);

            const user = await prisma.user.upsert({
              where: { phoneNumber: userMobile },
              update: {},
              create: { phoneNumber: userMobile },
            });

            const card = await prisma.card.upsert({
              where: { cardId },
              update: { userId: user.id },
              create: { cardId, userId: user.id },
            });

            await prisma.cardEvent.create({
              data: {
                cardId: card.id,
                eventType: EventType.PICKUP,
                timestamp,
              },
            });
          }
          console.log("Pickup data imported successfully.");
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

async function importDeliveryExceptionData() {
  const exceptionsFile = path.join(
    __dirname,
    "../data/Delivery_exceptions.csv"
  );
  const exceptions: any[] = [];

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(exceptionsFile)
      .pipe(csv())
      .on("data", (row) => {
        exceptions.push(row);
      })
      .on("end", async () => {
        try {
          for (const row of exceptions) {
            const cardId = row["Card ID"];
            let userContact = row["User contact"].replace(/"/g, ""); // Remove quotes
            const timestamp = parseDate(row["Timestamp"]);
            const comment = row["Comment"];

            const card = await prisma.card.findUnique({
              where: { cardId },
              include: { user: true },
            });

            if (!card) {
              console.warn(`Card ${cardId} not found.`);
              continue;
            }

            await prisma.cardEvent.create({
              data: {
                cardId: card.id,
                eventType: EventType.DELIVERY_EXCEPTION,
                timestamp,
                comment,
              },
            });
          }
          console.log("Delivery exception data imported successfully.");
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

async function importDeliveredData() {
  const deliveredFile = path.join(__dirname, "../data/Delivered.csv");
  const delivered: any[] = [];

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(deliveredFile)
      .pipe(csv())
      .on("data", (row) => {
        delivered.push(row);
      })
      .on("end", async () => {
        try {
          for (const row of delivered) {
            const cardId = row["Card ID"];
            let userContact = row["User contact"].replace(/"/g, ""); // Remove quotes
            const timestamp = parseDate(row["Timestamp"]);
            const comment = row["Comment"];

            const card = await prisma.card.findUnique({
              where: { cardId },
              include: { user: true },
            });

            if (!card) {
              console.warn(`Card ${cardId} not found.`);
              continue;
            }

            await prisma.cardEvent.create({
              data: {
                cardId: card.id,
                eventType: EventType.DELIVERED,
                timestamp,
                comment,
              },
            });
          }
          console.log("Delivered data imported successfully.");
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

async function importReturnedData() {
  const returnedFile = path.join(__dirname, "../data/Returned.csv");
  const returned: any[] = [];

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(returnedFile)
      .pipe(csv())
      .on("data", (row) => {
        returned.push(row);
      })
      .on("end", async () => {
        try {
          for (const row of returned) {
            const cardId = row["Card ID"];
            let userContact = row["User contact"].replace(/"/g, ""); // Remove quotes
            const timestamp = parseDate(row["Timestamp"]);

            const card = await prisma.card.findUnique({
              where: { cardId },
              include: { user: true },
            });

            if (!card) {
              console.warn(`Card ${cardId} not found.`);
              continue;
            }

            await prisma.cardEvent.create({
              data: {
                cardId: card.id,
                eventType: EventType.RETURNED,
                timestamp,
              },
            });
          }
          console.log("Returned data imported successfully.");
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

function parseDate(dateString: string): Date {
  const formats = [
    "dd/MM/yyyy HH:mm",
    "dd-MM-yyyy hh:mm a",
    "yyyy-MM-dd'T'HH:mm:ss'Z'",
    "dd-MM-yyyy HH:mm",
    "dd-MM-yyyy h:mm a",
    "M/d/yyyy H:mm",
    "dd-MM-yyyy h:mm:ss a",
    "dd-MM-yyyy h:mm a",
    'dd-MM-yyyy hh:mma',
  ];

  for (const format of formats) {
    const parsedDate = parse(dateString, format, new Date());
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }
  throw new Error(`Unable to parse date: ${dateString}`);
}

importData().catch((e) => {
  console.error("Error in importData:", e);
  prisma.$disconnect();
  process.exit(1);
});
