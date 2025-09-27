import { useEffect, useState } from "preact/hooks";
import projectLogo from "../assets/project-logo.png";

export function Destiny2SearchGUI(props: { hash?: string }) {
    const { hash } = props;
    const [searchDataItems, setSearchDataItems] = useState<any>(null);

    const d1SearchEvent = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const query = target.value;

        props.hash = query;

        if (query.length === 0) {
            setErrorMessage(
                "The query needs to be more than zero characters",
                "Please enter a search query."
            );
            return;
        }

        await searchForHash(query);
    };

    const searchForHash = async (hash: string) => {
        setSearchDataItems(
            <div className="text-gray-400">Searching for hash {hash}...</div>
        );

        const response = await fetch(
            `https://manifest.report/search/hash?hash=${encodeURIComponent(
                hash
            )}&limit=1000&includeData=true`
        );
        const data = await response.json();
        console.log("Response:", data);

        if (response.status !== 200) {
            switch (response.status) {
                case 400:
                    setErrorMessage(
                        "Bad Request",
                        <>
                            "The request was invalid. Please check your query
                            and try again.
                            <br />
                            {data.errors["hash"] &&
                                data.errors["hash"].join(", ")}
                        </>
                    );
                    break;
                case 404:
                    setErrorMessage(
                        "Not Found",
                        "The requested hash was not found."
                    );
                    break;
                default:
                    setErrorMessage(
                        "Error",
                        `An error occurred: ${data.message || "Unknown error"}`
                    );
            }
            return;
        }

        setSearchDataItems(null);
        if (data.data.length === 0) {
            setSearchDataItems(<p>No results found.</p>);
            return;
        }

        setSearchDataItems(
            <div>
                {data.data.map((item: any) =>
                    destinyItem(item.hash, item.definition, item)
                )}
            </div>
        );
    };

    const destinyItem = (hash: string, definition: string, data: any) => {
        return (
            <div className="mb-4 p-4 bg-gray-800 rounded-md">
                <h2 className="text-2xl font-bold mb-2">
                    Definition: {definition} (Hash: {hash})
                </h2>
                <pre className="overflow-x-auto">
                    <code>{JSON.stringify(data, null, 2)}</code>
                </pre>
            </div>
        );
    };

    const setErrorMessage = (title: string, message: any) => {
        setSearchDataItems(
            <div className="bg-red-600/50 text-white p-4 rounded-md mb-4">
                <strong>{title}</strong>
                <p>{message}</p>
            </div>
        );
    };

    const debounce = (func: Function, wait: number) => {
        let timeout: number | undefined;
        return (...args: any) => {
            const later = () => {
                timeout = undefined;
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const d1SearchEventDebounced = debounce(d1SearchEvent, 300);

    useEffect(() => {
        async function fetchData() {
            if (hash) {
                await searchForHash(hash);
            }
        }

        fetchData();
    }, []);

    return (
        <div class="h-[100vh]">
            <div>
                <input
                    type="search"
                    id="search-box"
                    name="search-box"
                    class="w-full h-full bg-gray-900/50 text-gray-200 p-4 rounded-md"
                    placeholder="Search Definitions..."
                    onKeyUp={d1SearchEventDebounced}
                    value={hash}
                />
                <img
                    src={projectLogo}
                    class="h-8 w-8 absolute right-2 top-2.5"
                />
            </div>
            <div class="p-4" id="destiny-1-search">
                {searchDataItems}
            </div>
        </div>
    );
}
