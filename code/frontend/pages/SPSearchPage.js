export default {
    template: `
    <div class="container mt-4">
        <div class="form-group mb-3">
            <select v-model="searchType" class="form-select mb-3" class="form-control mb-3">
                <option value="name">Search by Name</option>
                <option value="location">Search by Location</option>
            </select>

            <input 
                :placeholder="searchType === 'name' ? 'Service Professional name' : 'Location'"
                v-model="searchQuery"
                class="form-control mb-3"
            />

            <button class='btn btn-dark' @click="search" :disabled="!searchQuery">
                Search
            </button>
        </div>
    </div>
    `,
    data() {
        return {
            searchType: 'name', // default search type
            searchQuery: '',
        }
    },
    methods: {
        async search() {
            try {
                localStorage.removeItem('professionals');
                const res = await fetch(`${location.origin}/search/professionals/${this.searchType}/${this.searchQuery}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('token')
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem("professionals", JSON.stringify(data));
                    this.$router.push('/sp-search-results');
                } else {
                    console.error('Search failed:', res.statusText);
                }
            } catch (error) {
                console.error('Error during search:', error);
            }
        }
    }
}