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

    const d2SearchEvent = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const query = target.value;

        props.hash = query;

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
        setSearchDataItems(
            <div className="text-gray-400">
                Searching for the hash {hash}...
            </div>
        );

        const hashResponse = await fetch(
            `https://manifest.report/search/hash?hash=${encodeURIComponent(
                hash
            )}&limit=1000`
        );
        const hashData = await hashResponse.json();
        console.log("Hash Response:", hashData);

        setSearchDataItems(
            <div className="text-gray-400">
                Searching for definitions with the name {hash}...
            </div>
        );

        const nameResponse = await fetch(
            `https://manifest.report/search/name?name=${encodeURIComponent(
                hash
            )}&limit=1000`
        );
        const nameData = await nameResponse.json();
        console.log("Name Response:", nameData);

        let hashFound = true;
        let nameFound = true;

        if (hashResponse.status !== 200) {
            switch (hashResponse.status) {
                case 400:
                    hashFound = false;
                    break;
                case 404:
                    hashFound = false;
                    break;
            }
        }

        if (nameResponse.status !== 200) {
            switch (nameResponse.status) {
                case 400:
                    nameFound = false;
                    break;
                case 404:
                    nameFound = false;
                    break;
            }
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
            <div className="gap-4 p-4 bg-gray-800 rounded-md xl:min-w-[24vw] xl:max-w-[24vw] lg:min-w-[31vw] lg:max-w-[31vw] sm:min-w-[46vw] sm:max-w-[46vw] max-w-[93vw] min-w-[93vw]">
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
                        {data.displayName ?? (
                            <span className="text-gray-500 italic">
                                Unknown Name
                            </span>
                        )}
                        <br />
                        <small className="text-sm text-gray-400/50">
                            (Hash: {hash})
                        </small>
                    </div>
                </div>
                <pre className="overflow-x-auto hidden">
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
        <div class="h-[100vh]">
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
        </div>
    );
}
