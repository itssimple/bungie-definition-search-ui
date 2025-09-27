import projectLogo from "../assets/project-logo.png";

const d1SearchEvent = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const query = target.value;

    if (query.length === 0) {
        setErrorMessage(
            "The query needs to be more than zero characters",
            "Please enter a search query."
        );
        return;
    }

    const response = await fetch(
        `https://manifest.report/d1/hash/search?hash=${encodeURIComponent(
            query
        )}&limit=1000`
    );
    const data = await response.json();
    console.log("Response:", data);

    if (response.status !== 200) {
        console.error("Error fetching data:", data);
        setErrorMessage(
            data.title,
            `Error fetching data: ${data.message || "Unknown error"}`
        );
        return;
    }

    const container = document.getElementById("destiny-1-search");
    if (!container) return;

    // Clear any existing content
    container.innerHTML = "";
    if (data.data.length === 0) {
        container.innerHTML = "<p>No results found.</p>";
        return;
    }
    const list = document.createElement("ul");
    data.data.forEach((result: any) => {
        const listItem = document.createElement("li");
        listItem.className = "mb-2";
        listItem.innerHTML = `
			<a href="/destiny1/${result.hash}" class="text-blue-500 hover:underline">
				<strong>Hash:</strong> ${result.hash} - <strong>Type:</strong> ${
            result.type
        } - <strong>Name:</strong> ${result.name || "N/A"}
			</a>
		`;
        list.appendChild(listItem);
    });
    container.appendChild(list);
};

const setErrorMessage = (title: string, message: string) => {
    const container = document.getElementById("destiny-1-search");
    if (!container) return;

    // Clear any existing error messages
    container.innerHTML = "";

    // Create the error message element
    const errorMessage = document.createElement("div");
    errorMessage.className = "bg-red-600/50 text-white p-4 rounded-md mb-4";
    errorMessage.innerHTML = `<strong>${title}</strong><p>${message}</p>`;
    container.appendChild(errorMessage);
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

export function Destiny1SearchGUI() {
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
                />
                <img
                    src={projectLogo}
                    class="h-8 w-8 absolute right-2 top-2.5"
                />
            </div>
            <div class="p-4" id="destiny-1-search">
                Destiny 1 Definition Search
            </div>
        </div>
    );
}
