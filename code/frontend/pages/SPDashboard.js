export default {
    template: `
    <div style="display: flex;justify-content: center;align-items: center; margin-top: 150px;">
        <div style="margin: auto; width: 50%;border: 2px solid rgb(185, 185, 185); margin-top:20px ;background-color: white;padding:100px 20px 100px 20px;">
            <h1 style="text-align: center;color: black; font-weight: bolder; margin-bottom: 20px">Service Professional Dashboard</h1> 
            <div style="display: flex; justify-content: center;align-items: center; margin-top: 50px; flex-direction: row; gap: 10px ">
            
                    <button class='btn btn-dark' @click="fetchRequests('requested')">Pending Service Requests</button>
                    <button class='btn btn-dark' @click="fetchRequests('assigned')">Accepted Service Requests</button>    
              
                    <button class='btn btn-secondary' @click="fetchRequests('rejected')">Rejected Service Requests</button>
                    <button class='btn btn-secondary' @click="fetchRequests('closed')">Closed Service Requests</button>

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
        async fetchRequests(status) {
            // clear it first
            localStorage.removeItem('requests');
            localStorage.removeItem('requestStatus');

            const response = await fetch(`${location.origin}/professional/service-requests/${localStorage.getItem('id')}/all`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': `${localStorage.getItem('token')}`,
                }
            });

            const requests = await response.json();
            localStorage.setItem('requests', JSON.stringify(requests));
            localStorage.setItem('requestStatus', status);

            this.$router.push('/professional-requests');
        }
    }
};
