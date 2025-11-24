import { getCurrentUser } from "./actions/authActions";
import Listings from "./auctions/Listings";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div>
      <Listings user={user} />
    </div>
  )
}
