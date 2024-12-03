export default {
    template: `
       <div style="display: flex;justify-content: center;align-items: center; margin-top: 150px;">
        <div style="margin: auto; width: 50%;border: 2px solid rgb(185, 185, 185); margin-top:20px ;background-color: white;padding: 20px;">
                <h1 style="text-align: center;color: black; font-weight: bolder;">Customer Dashboard</h1> 
                <div style="display: flex; justify-content: space-around ; margin-top: 50px;">
                    <router-link to='/search-professionals' class="btn btn-dark">New Service Request</router-link>
                    <button @click="fetchRequests()" class="btn btn-dark">All Service Requests</button>
                </div>
        </div> 
    </div>
    `,
    mounted() {
        if (localStorage.getItem('approved') == 'false') {
            this.$router.push('/not-approved');
        }
    },
    methods: {
        async fetchRequests() {
            try {
                localStorage.removeItem('requests');
                const res = await fetch(`${location.origin}/customer/service-requests/${localStorage.getItem('id')}/all`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('token')
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem("requests", JSON.stringify(data));
                    this.$router.push('/customer-requests');
                } else {
                    console.error('Request fetch failed:', res.statusText);
                }
            } catch (error) {
                console.error('Error during request fetch:', error);
            }
        }
    }
}
