import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { Filter } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CreateLink } from "@/components/Create-link";
import Error from "@/components/Error";
import LinkCard from "@/components/Link-card";


import useFetch from "@/hooks/use-Fetch";
import { getUrls } from "@/db/apiUrls";
import { getClicksForUrls } from "@/db/apiClicks";
import { UrlState } from "@/context";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = UrlState() || {}; // ✅ Ensures user is never null

  const { loading, error, data: urls = [], fn: fnUrls } = useFetch(getUrls, user?.id); // ✅ Ensures urls is always an array
  const {
    loading: loadingClicks,
    data: clicks = [], // ✅ Ensures clicks is always an array
    fn: fnClicks,
  } = useFetch(getClicksForUrls, urls?.map((url) => url.id) || []);

  useEffect(() => {
    if (user?.id) fnUrls(); // ✅ Fetch only when user is available
  }, [fnUrls, user?.id]);

  useEffect(() => {
    if (urls && urls.length) {
      fnClicks();
    }
  }, [fnClicks, urls, urls.length]);

  // ✅ Added check for null/undefined urls before filtering
  const filteredUrls = (urls || []).filter(
    (url) => url?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {(loading || loadingClicks) && <BarLoader width={"100%"} color="#36d7b7" />}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Links Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{urls?.length || 0}</p> {/* ✅ Ensures urls.length never throws an error */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{clicks?.length || 0}</p> {/* ✅ Ensures clicks.length never throws an error */}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <h1 className="text-4xl font-extrabold">My Links</h1>
        <CreateLink />
      </div>

      <div className="relative">
        <Input
          type="text"
          placeholder="Filter Links..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Filter className="absolute top-2 right-2 p-1" />
      </div>

      {error && <Error message={error.message} />}

      {filteredUrls.length > 0 ? (
        filteredUrls.map((url, i) => <LinkCard key={i} url={url} fetchUrls={fnUrls} />)
      ) : (
        <p>No links found.</p>
      )}
    </div>
  );
};

export default Dashboard;
