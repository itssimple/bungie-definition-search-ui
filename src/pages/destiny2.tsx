import { useEffect, useState } from "preact/hooks";
import projectLogo from "../assets/project-logo.png";

type Destiny2ResponseItem = {
    definition: string;
    hash: string;
    displayName: string | null;
    displayIcon: string | null;
    data: any;
};

export function Destiny2SearchGUI(props: { hash?: string }) {
    const { hash } = props;
    const [searchDataItems, setSearchDataItems] = useState<any>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerData, setDrawerData] = useState<any>(null);

    const d2SearchEvent = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const query = target.value;

        props.hash = query;

        if (!Number.isNaN(Number.parseInt(query))) {
            await searchForHash(query);
            return;
        }

        if (query.length < 3) {
            setErrorMessage(
                "The query needs to be at least three characters",
                "Please enter a search query."
            );
            return;
        }

        await searchForHash(query);
    };

    const searchForHash = async (hash: string) => {
        let hashResponse = null;
        let hashData = null;

        let nameResponse = null;
        let nameData = null;

        if (!Number.isNaN(Number.parseInt(hash))) {
            setSearchDataItems(
                <div className="text-gray-400">
                    Searching for the hash {hash}...
                </div>
            );

            hashResponse = await fetch(
                `https://manifest.report/search/hash?hash=${encodeURIComponent(
                    hash
                )}&limit=1000&includeData=true`
            );
            hashData = await hashResponse.json();
            console.log("Hash Response:", hashData);
        }

        if (hash.length >= 3) {
            setSearchDataItems(
                <div className="text-gray-400">
                    Searching for definitions with the name {hash}...
                </div>
            );

            nameResponse = await fetch(
                `https://manifest.report/search/name?name=${encodeURIComponent(
                    hash
                )}&limit=1000&includeData=true`
            );
            nameData = await nameResponse.json();
            console.log("Name Response:", nameData);
        }

        let hashFound = false;
        let nameFound = false;

        if (hashResponse && hashResponse.status === 200) {
            hashFound = true;
        }

        if (nameResponse && nameResponse.status === 200) {
            nameFound = true;
        }

        setSearchDataItems(null);
        if (
            hashFound &&
            hashData.data.length === 0 &&
            nameFound &&
            nameData.data.length === 0
        ) {
            setSearchDataItems(<p>No results found.</p>);
            return;
        }

        let combinedData: any[] = [];
        if (hashFound) combinedData = [...hashData.data];
        if (nameFound && hashFound)
            combinedData = [
                ...combinedData,
                ...nameData.data.filter(
                    (nameItem: any) =>
                        !hashData.data.some(
                            (hashItem: any) => hashItem.hash === nameItem.hash
                        )
                ),
            ];
        else if (nameFound) combinedData = [...nameData.data];

        const groupedByDefinition = combinedData.reduce(
            (
                acc: { [key: string]: Destiny2ResponseItem[] },
                item: Destiny2ResponseItem
            ) => {
                if (!acc[item.definition]) {
                    acc[item.definition] = [];
                }
                acc[item.definition].push(item);
                return acc;
            },
            {}
        );

        // Sort the grouped definitions alphabetically
        const sortedDefinitions = Object.keys(groupedByDefinition).sort();
        const sortedGroupedByDefinition: Record<string, any[]> = {};
        for (const def of sortedDefinitions) {
            sortedGroupedByDefinition[def] = groupedByDefinition[def];
        }

        setSearchDataItems(
            <>
                <div className="mb-4 text-gray-400">
                    <em>Found {combinedData.length} results</em>
                </div>
                <div>
                    <>
                        {Object.entries(sortedGroupedByDefinition).map(
                            ([def, items]) => (
                                <div key={def}>
                                    <h3 className="text-xl font-bold">{def}</h3>
                                    <div class="flex flex-wrap gap-2 mb-4 w-full">
                                        {items.map((item) =>
                                            destinyItem(item.hash, item)
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                    </>
                </div>
            </>
        );
    };

    const destinyItem = (hash: string, data: Destiny2ResponseItem) => {
        return (
            <div
                className="gap-4 p-4 bg-gray-800 rounded-md xl:min-w-[24vw] xl:max-w-[24vw] lg:min-w-[31vw] lg:max-w-[31vw] sm:min-w-[46vw] sm:max-w-[46vw] max-w-[93vw] min-w-[93vw]"
                style={{ cursor: "pointer" }}
                onClick={() => {
                    setDrawerOpen(true);
                    setDrawerData(data.data);
                }}
            >
                <div className="font-bold mb-2 align-middle flex items-center">
                    <object
                        data={`https://storage.manifest.report/manifest-archive/images${
                            data.displayIcon ?? "/img/misc/missing_icon_d2.png"
                        }`}
                        type="image/png"
                        class="min-w-16 min-h-16 max-h-16 max-w-16 bg-cover bg-no-repeat inline-block mr-4 rounded-sm"
                    >
                        <img
                            class="min-w-16 min-h-16 max-h-16 max-w-16 bg-cover bg-no-repeat inline-block mr-4 rounded-sm"
                            src="https://storage.manifest.report/manifest-archive/images/img/misc/missing_icon_d2.png"
                        />
                    </object>
                    <div className="mr-4">
                        <span>
                            {data.displayName ?? (
                                <span className="text-gray-500 italic">
                                    Unknown Name
                                </span>
                            )}
                        </span>
                        <br />
                        <small className="text-sm text-gray-400/50">
                            (Hash: {hash})
                        </small>
                    </div>
                </div>
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

    const d2SearchEventDebounced = debounce(d2SearchEvent, 300);

    useEffect(() => {
        async function fetchData() {
            if (hash) {
                await searchForHash(hash);
            }
        }

        fetchData();
    }, []);

    return (
        <div class="h-[100vh] relative">
            <div>
                <input
                    type="search"
                    id="search-box"
                    name="search-box"
                    class="w-full h-full bg-gray-900/50 text-gray-200 p-4 rounded-md"
                    placeholder="Search Destiny 2 Definitions..."
                    onKeyUp={d2SearchEventDebounced}
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
            {/* Side Drawer */}
            {
                <>
                    <div
                        className="fixed inset-0 bg-black/25 z-40"
                        style={{
                            display: drawerOpen ? "block" : "none",
                        }}
                        onClick={() => setDrawerOpen(false)}
                    />
                    <div
                        className="fixed top-0 right-0 h-full md:w-[50vw] sm:w-full bg-gray-900 shadow-lg z-50 flex flex-col"
                        style={{
                            transition: "all 0.3s",
                            transform: drawerOpen
                                ? "translateX(0)"
                                : "translateX(100%)",
                        }}
                    >
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <span className="font-bold text-lg">Item Data</span>
                            <button
                                className="text-gray-400 hover:text-white px-2 py-1 rounded"
                                onClick={() => setDrawerOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                            <pre className="whitespace-pre-wrap break-all text-sm text-gray-200">
                                <code>
                                    {JSON.stringify(drawerData, null, 2)}
                                </code>
                            </pre>
                        </div>
                    </div>
                </>
            }
        </div>
    );
}
