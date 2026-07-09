import projectLogo from "../assets/project-logo.png";

export function Home() {
    return (
        <div class="app">
            <div>
                <img
                    src={projectLogo}
                    class="logo inline-block"
                    alt="Bungie Definition Search logo"
                />
                <div class="spaced-header">Bungie Definition Search</div>
            </div>

            <p class="fui body mt-4">
                This is a simple search UI for Destiny 1/2 Definition Hashes.
            </p>
            <div class="section-label mt-8 text-left">
                Select which game you want to search
            </div>
            <div class="grid gap-5 mt-6 sm:grid-cols-2 text-left">
                <a class="card selectable accent-solar" href="/destiny1/">
                    <div class="card-header">
                        <span class="card-title">Destiny 1</span>
                        <span class="card-subtitle">2014 – 2017</span>
                    </div>
                    <div class="card-body">
                        Search the classic-era manifest — items, activities,
                        vendors and everything in between.
                    </div>
                    <div class="card-footer">
                        <span class="key-prompt">
                            <span class="key outline">↵</span> Search Destiny 1
                        </span>
                    </div>
                </a>
                <a class="card selectable accent-arc" href="/destiny2/">
                    <div class="card-header">
                        <span class="card-title">Destiny 2</span>
                        <span class="card-subtitle">2017 –</span>
                    </div>
                    <div class="card-body">
                        Search the live Destiny 2 manifest, straight from the
                        latest definition archives.
                    </div>
                    <div class="card-footer">
                        <span class="key-prompt">
                            <span class="key outline">↵</span> Search Destiny 2
                        </span>
                    </div>
                </a>
            </div>
        </div>
    );
}
