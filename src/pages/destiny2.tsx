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

        let hashOver1000 = false;
        let nameOver1000 = false;

        if (!Number.isNaN(Number.parseInt(hash))) {
            setSearchDataItems(
                <div className="fui body text-muted">
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
                <div className="fui body text-muted">
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
            setSearchDataItems(
                <p className="fui body text-muted">No results found.</p>
            );
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

        let totalCount = 0;

        // Check if any results were found
        if (hashFound && hashData.totalCount > 1000) {
            hashOver1000 = true;
        }
        if (nameFound && nameData.totalCount > 1000) {
            nameOver1000 = true;
        }

        if (hashData && hashData.totalCount) {
            totalCount += hashData.totalCount;
        }
        if (nameData && nameData.totalCount) {
            totalCount += nameData.totalCount;
        }

        // Sort the grouped definitions alphabetically
        const sortedDefinitions = Object.keys(groupedByDefinition).sort();
        const sortedGroupedByDefinition: Record<string, any[]> = {};
        for (const def of sortedDefinitions) {
            sortedGroupedByDefinition[def] = groupedByDefinition[def];
        }

        setSearchDataItems(
            <>
                <div className="mb-4 fui body fiction text-muted">
                    Found {totalCount.toLocaleString()} results
                    {hashOver1000 || nameOver1000
                        ? ", some results may be truncated, max 1000 shown per search (hash/name)"
                        : ""}
                </div>
                <div>
                    <>
                        {Object.entries(sortedGroupedByDefinition).map(
                            ([def, items]) => (
                                <div key={def}>
                                    <div
                                        className="header tooltip mt-6 mb-3"
                                        style={{ textTransform: "none" }}
                                    >
                                        {def}
                                    </div>
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
                className="card selectable xl:min-w-[24vw] xl:max-w-[24vw] lg:min-w-[31vw] lg:max-w-[31vw] sm:min-w-[46vw] sm:max-w-[46vw] max-w-[93vw] min-w-[93vw]"
                style={{ cursor: "pointer" }}
                onClick={() => {
                    setDrawerOpen(true);
                    setDrawerData(data.data);
                }}
            >
                <div className="card-body flex items-center">
                    <object
                        data={`https://storage.manifest.report/manifest-archive/images${
                            data.displayIcon ?? "/img/misc/missing_icon_d2.png"
                        }`}
                        type="image/png"
                        class="min-w-16 min-h-16 max-h-16 max-w-16 bg-cover bg-no-repeat inline-block mr-4"
                    >
                        <img
                            class="min-w-16 min-h-16 max-h-16 max-w-16 bg-cover bg-no-repeat inline-block mr-4"
                            src="https://storage.manifest.report/manifest-archive/images/img/misc/missing_icon_d2.png"
                        />
                    </object>
                    <div className="mr-4">
                        <span className="fui sub-title bold">
                            {data.displayName ?? (
                                <span className="text-muted hud description">
                                    Unknown Name
                                </span>
                            )}
                        </span>
                        <br />
                        <small className="text-sm text-muted">
                            (Hash: {hash})
                        </small>
                    </div>
                </div>
            </div>
        );
    };

    const setErrorMessage = (title: string, message: any) => {
        setSearchDataItems(
            <div className="card accent-solar mb-4" style={{ maxWidth: "40rem" }}>
                <div className="card-header">
                    <span className="card-title text-danger">{title}</span>
                </div>
                <div className="card-body">{message}</div>
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
        <div class="min-h-[100vh] relative">
            <div class="relative">
                <input
                    type="search"
                    id="search-box"
                    name="search-box"
                    class="text-input w-full"
                    style={{ padding: "1rem", paddingRight: "3.5rem" }}
                    placeholder="Search Destiny 2 Definitions..."
                    onKeyUp={d2SearchEventDebounced}
                    value={hash}
                />
                <a href="/">
                    <img
                        src={projectLogo}
                        class="h-8 w-8 absolute right-2 top-2.5"
                    />
                </a>
            </div>
            <div class="p-4" id="destiny-2-search">
                {searchDataItems}
            </div>
            {/* Side Drawer */}
            {
                <>
                    <div
                        className="dialog-backdrop"
                        style={{
                            display: drawerOpen ? "block" : "none",
                        }}
                        onClick={() => setDrawerOpen(false)}
                    />
                    <div
                        className="fixed top-0 right-0 h-full md:w-[50vw] sm:w-full shadow-lg flex flex-col"
                        style={{
                            zIndex: 101,
                            transition: "all 0.3s",
                            backgroundColor: "var(--d2-background)",
                            borderLeft: "0.1rem solid var(--d2-border)",
                            transform: drawerOpen
                                ? "translateX(0)"
                                : "translateX(100%)",
                        }}
                    >
                        <div
                            className="p-4 flex justify-between items-center"
                            style={{
                                borderBottom:
                                    "0.1rem solid var(--d2-border-faint)",
                            }}
                        >
                            <span className="header tooltip">Item Data</span>
                            <button
                                className="button small ghost"
                                onClick={() => setDrawerOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                            <pre className="whitespace-pre-wrap break-all text-sm">
                                <code style={{ fontFamily: "monospace" }}>
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
