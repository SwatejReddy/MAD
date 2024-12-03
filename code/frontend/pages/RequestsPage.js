export default {
    template: `
    <div style="display: flex;justify-content: center;align-items: center; margin-top: 150px;">
        <div style="margin: auto; width: 50%;border: 2px solid rgb(185, 185, 185); margin-top:20px ;background-color: white;padding:100px 20px 100px 20px;">
                <h1 style="text-align: center;color: black; font-weight: bolder;">{{ currentStatus | capitalize }} Requests</h1> 
                <div style="display: flex; justify-content: center margin-top: 50px; flex-direction: column; gap: 10px ;margin: 50px 0px 0px 20px;">     
                    <div v-if="filteredRequests.length > 0">
                        <div v-for="(request, index) in filteredRequests" :key="index">
                            <div style="border: 2px solid rgb(185, 185, 185);padding: 10px;margin: 10px">
                                <p>Customer ID: {{ request.customer_id }}</p>
                                <p>Service ID: {{ request.service_id }}</p>
                                <p>Status: {{ request.service_status }}</p>
                                <p>Date of Request: {{ request.date_of_request }}</p>
                                <p>Date of Completion: {{ request.date_of_completion }}</p>
                                <div v-if="currentStatus === 'requested'">
                                    <button class='btn btn-dark' @click="acceptRequest(request)">Accept</button>
                                    <button class='btn btn-secondary' @click="rejectRequest(request)">Reject</button>
                                </div>
                                <div v-if="currentStatus === 'assigned'">
                                    <button class='btn btn-dark' @click="closeRequest(request)">Close</button>
                                </div>
                                
                            </div>                            
                        </div>
                    </div>
                    <div v-else>
                        <p style="text-align: center;color: gray; font-style: italic">No {{ currentStatus }} requests found.</p>
                    </div>
                </div>
        </div>
    </div>
        
            
            
       
    `,
    data() {
        return {
            requests: [],
            currentStatus: ''
        };
    },
    computed: {
        filteredRequests() {
            return this.requests.filter(request =>
                request.service_status === this.currentStatus
            );
        }
    },
    mounted() {
        const storedRequests = localStorage.getItem('requests');
        const status = localStorage.getItem('requestStatus');

        if (storedRequests) {
            this.requests = JSON.parse(storedRequests);
            this.currentStatus = status;
        }
    },
    methods: {
        async acceptRequest(request) {
            const response = await fetch(`${location.origin}/professional/service-request/accept/${request.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': `${localStorage.getItem('token')}`,
                }
            });

            if (response.ok) {
                const updatedRequest = await response.json();
                const index = this.requests.findIndex(req => req.id === request.id);
                this.requests.splice(index, 1, updatedRequest);
            }
        },
        async rejectRequest(request) {
            const response = await fetch(`${location.origin}/professional/service-request/reject/${request.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': `${localStorage.getItem('token')}`,
                }
            });

            if (response.ok) {
                const updatedRequest = await response.json();
                const index = this.requests.findIndex(req => req.id === request.id);
                this.requests.splice(index, 1, updatedRequest);
            }
        },
        async closeRequest(request) {
            const response = await fetch(`${location.origin}/professional/service-request/close/${request.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': `${localStorage.getItem('token')}`,
                }
            });

            if (response.ok) {
                const updatedRequest = await response.json();
                const index = this.requests.findIndex(req => req.id === request.id);
                this.requests.splice(index, 1, updatedRequest);
            }

            this.$router.push('/professional-dashboard');
        }
    }
};