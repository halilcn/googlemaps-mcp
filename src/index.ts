#!/usr/bin/env node

import dotenv from "dotenv";
dotenv.config();

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import services from "./services";

const placeTypes = [
  "accounting",
  "airport",
  "amusement_park",
  "aquarium",
  "art_gallery",
  "atm",
  "bakery",
  "bank",
  "bar",
  "beauty_salon",
  "bicycle_store",
  "book_store",
  "bowling_alley",
  "bus_station",
  "cafe",
  "campground",
  "car_dealer",
  "car_rental",
  "car_repair",
  "car_wash",
  "casino",
  "cemetery",
  "church",
  "city_hall",
  "clothing_store",
  "convenience_store",
  "courthouse",
  "dentist",
  "department_store",
  "doctor",
  "drugstore",
  "electrician",
  "electronics_store",
  "embassy",
  "fire_station",
  "florist",
  "funeral_home",
  "furniture_store",
  "gas_station",
  "gym",
  "hair_care",
  "hardware_store",
  "hindu_temple",
  "home_goods_store",
  "hospital",
  "insurance_agency",
  "jewelry_store",
  "laundry",
  "lawyer",
  "library",
  "light_rail_station",
  "liquor_store",
  "local_government_office",
  "locksmith",
  "lodging",
  "meal_delivery",
  "meal_takeaway",
  "mosque",
  "movie_rental",
  "movie_theater",
  "moving_company",
  "museum",
  "night_club",
  "painter",
  "park",
  "parking",
  "pet_store",
  "pharmacy",
  "physiotherapist",
  "plumber",
  "police",
  "post_office",
  "primary_school",
  "real_estate_agency",
  "restaurant",
  "roofing_contractor",
  "rv_park",
  "school",
  "secondary_school",
  "shoe_store",
  "shopping_mall",
  "spa",
  "stadium",
  "storage",
  "store",
  "subway_station",
  "supermarket",
  "synagogue",
  "taxi_stand",
  "tourist_attraction",
  "train_station",
  "transit_station",
  "travel_agency",
  "university",
  "veterinary_care",
  "zoo",
] as const;

const server = new McpServer({
  name: "Google Maps",
  description: "Fetches relevant data using Google Maps services",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {
      get_nearby_places_by_coordinates: {
        description:
          "Fetches nearby places based on geographic coordinates. Returns up to 60 relevant places as determined by Google's proximity algorithm",
        parameters: {
          lat: { type: "string", description: "Latitude of the location" },
          lng: { type: "string", description: "Longitude of the location" },
          type: {
            type: "string",
            description: "Type of the place",
            optional: true,
          },
          radius: {
            type: "number",
            description: "Radius of the search",
            optional: true,
          },
        },
      },
    },
  },
});

server.tool(
  "get_nearby_places_by_coordinates",
  "Fetches nearby places based on geographic coordinates. Returns up to 60 relevant places as determined by Google's proximity algorithm",
  {
    lat: z.string().describe("Latitude of the location"),
    lng: z.string().describe("Longitude of the location"),
    type: z.enum(placeTypes).optional().describe("Type of the place"),
    radius: z.number().optional().describe("Radius of the search"),
  },
  async ({ lat, lng, type, radius: _radius }) => {
    try {
      const radius = _radius || 2000;

      const allPlaces = await services.handleGetAllNearbyPlaces({ lat, lng, type, radius });

      return {
        isError: false,
        content: [
          {
            type: "text",
            text: `All Places: ${JSON.stringify(allPlaces, null, 2)}`,
          },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error: ${err?.toString() || "Unknown Error"}`,
          },
        ],
      };
    }
  }
);

async function main() {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error(
      "GOOGLE_API_KEY environment variable is not set. Please provide a valid Google Maps API key."
    );
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Maps MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
