export default {
    template: `
    <div class="container mt-4">
        <div class="form-group mb-3">
            <select v-model="searchType" class="form-select mb-3" class="form-control mb-3">
                <option value="customer">Customer</option>
                <option value="professional">Professional</option>
            </select>

            <input 
                :placeholder="searchType === 'customer' ? 'Customer' : 'Service Professional'"
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
            searchType: 'customer', // default search type
            searchQuery: '',
        }
    },
    methods: {
        async search() {
            if (this.searchType === 'customer') {
                try {
                    localStorage.removeItem('customers');
                    localStorage.removeItem('professionals');
                    const res = await fetch(`${location.origin}/admin/search/customers/${this.searchQuery}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authentication-Token': localStorage.getItem('token')
                        }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        localStorage.setItem("customers", JSON.stringify(data));
                        this.$router.push('/user-search-results');
                    } else {
                        console.error('Search failed:', res.statusText);
                    }
                } catch (error) {
                    console.error('Error during search:', error);
                }
            }
            else if (this.searchType === 'professional') {
                try {
                    localStorage.removeItem('customers');
                    localStorage.removeItem('professionals');
                    const res = await fetch(`${location.origin}/admin/search/professionals/${this.searchQuery}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authentication-Token': localStorage.getItem('token')
                        }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        localStorage.setItem("professionals", JSON.stringify(data));
                        this.$router.push('/user-search-results');
                    } else {
                        console.error('Search failed:', res.statusText);
                    }
                } catch (error) {
                    console.error('Error during search:', error);
                }

            }
        }
    }
}