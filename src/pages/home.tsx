import projectLogo from "../assets/project-logo.png";

export function Home() {
    return (
        <div class="app place-items-center">
            <div>
                <img
                    src={projectLogo}
                    class="logo inline-block"
                    alt="PGCR Viewer logo"
                />
                <h1 class="text-4xl font-bold mb-2 inline-block align-middle ml-4">
                    Bungie Definition Search
                </h1>
            </div>

            <p>This is a simple search UI for Destiny 1/2 Definition Hashes.</p>
            <p>Select which game you want to search for</p>
            <div class="flex items-center gap-4 justify-center mt-8">
                <a
                    class="bg-gray-900 text-gray-200 p-2 rounded-md text-3xl cursor-pointer hover:bg-gray-800"
                    href="/destiny1/"
                >
                    Destiny 1
                </a>
                <a
                    class="bg-gray-900 text-gray-200 p-2 rounded-md text-3xl cursor-pointer hover:bg-gray-800"
                    href="/destiny2/"
                >
                    Destiny 2
                </a>
            </div>
        </div>
    );
}
