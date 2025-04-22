interface GetAllNearbyPlacesProps {
    lat: string;
    lng: string;
    radius: number;
    type?: string;
    pageToken?: string;
}

interface ListPlaceItemProps {
    geometry: { location: { lat: number, lng: number } };
    name: string;
    opening_hours: { open_now: boolean };
    place_id: string;
    rating: number;
    reference: string;
    user_ratings_total: number;
}

const googleServiceUrl = "https://maps.googleapis.com/maps/api"


const handleGetNearbyPlaces = async ({ lat, lng, type = '', radius, pageToken = '' }: GetAllNearbyPlacesProps) => {
    const response = await fetch(`${googleServiceUrl}/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&pagetoken=${pageToken}&key=${process.env.GOOGLE_API_KEY}`);
    const { results, next_page_token } = await response.json();
    return {
        results,
        next_page_token
    };
}

const mapListPlaceItem = ({ geometry: { location }, name, opening_hours, place_id, rating, reference, user_ratings_total }: ListPlaceItemProps) => ({ location, name, opening_hours, place_id, rating, reference, user_ratings_total })
const handleGetAllNearbyList = async ({ lat, lng, type, radius }: GetAllNearbyPlacesProps) => {
    let nextPageToken;
    let firstStart = true;
    const allPlaces = [];

    while (firstStart || !!nextPageToken) {
        const { results, next_page_token } = await handleGetNearbyPlaces({ lat, lng, type, radius, ...(!!nextPageToken && { pageToken: nextPageToken }) });
        const mappedResults = results.map(mapListPlaceItem);
        allPlaces.push(...mappedResults);

        firstStart = false;
        nextPageToken = next_page_token;

        await new Promise(resolve => setTimeout(resolve, 2000)); // next page should be ready on google service
    }

    return allPlaces;
}

const handleGetNearbyPlaceDetails = async ({ placeId }: { placeId: string }) => {
    const response = await fetch(`${googleServiceUrl}/place/details/json?place_id=${placeId}&fields=reviews,formatted_address&key=${process.env.GOOGLE_API_KEY}`);
    const { result } = await response.json();

    const { reviews, formatted_address } = result;
    return { reviews, formatted_address };
}

const handleGetAllNearbyPlaceDetails = async ({ placeIds }: { placeIds: string[] }) => {
    const allPromises = placeIds.map(async (placeId) => {
        const result = await handleGetNearbyPlaceDetails({ placeId });
        return { place_id: placeId, ...result };
    })
    const allResults = await Promise.all(allPromises);

    return allResults
}

const getPreparedPlaces = ({ allPlaces, allPlacesWithDetail }: { allPlaces: any[], allPlacesWithDetail: any[] }) => {
    return allPlaces.map((place) => {
        const placeWithDetail = allPlacesWithDetail.find((p) => p.place_id === place.place_id);
        return {
            ...place,
            ...placeWithDetail
        }
    })

}

const handleGetAllNearbyPlaces = async ({ lat, lng, type = '', radius = 2000 }: GetAllNearbyPlacesProps) => {
    const allPlaces = await handleGetAllNearbyList({ lat, lng, type, radius });

    const allPlaceIds = allPlaces.map(({ place_id }) => place_id);
    const allPlacesWithDetail = await handleGetAllNearbyPlaceDetails({ placeIds: allPlaceIds });

    const allPreparedPlaces = getPreparedPlaces({
        allPlaces,
        allPlacesWithDetail
    })

    return allPreparedPlaces;
}

export default {
    handleGetAllNearbyPlaces
}