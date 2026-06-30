import { useQuery } from "@tanstack/react-query";

function App() {
  const { data, isPending, error } = useQuery({
    queryKey: ["hello"],
    queryFn: () => fetch("/api/hello").then((res) => res.json()),
  });

  if (isPending) return <p>Loading...</p>;

  // if (error) return <p>Something went wrong.</p>;

  return (
    <div>
      <h1>{data.firstName}</h1>
      <h2>{data.lastName}</h2>
    </div>
  );
}

export default App;