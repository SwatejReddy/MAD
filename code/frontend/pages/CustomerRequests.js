export default {
    template: `
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-6">Customer Requests</h1>
        
        <div v-if="requests.length === 0">
            <p>No requests found.</p>
        </div>
        
        <div v-else>
            <div v-for="request in requests" :key="request.id" class="mb-4 p-4 border rounded-lg shadow-sm">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-semibold">Request ID: {{ request.id }}</p>
                        <p>Date Requested: {{ formatDate(request.date_of_request) }}</p>
                        <p>Completion Date: {{ request.date_of_completion ? formatDate(request.date_of_completion) : 'Not set' }}</p>
                        <p>Status: <span :class="getStatusClass(request.service_status)">{{ request.service_status }}</span></p>
                        <p>Remarks: {{ request.remarks || 'No remarks' }}</p>
                    </div>
                    
                    <div>
                        <button 
                            v-if="request.service_status === 'requested'"
                            @click="startEdit(request)"
                            class="btn btn-dark"
                        >
                            Edit
                        </button>
                        
                        <div v-if="request.service_status === 'assigned'" class="flex gap-2 items-center">
                            <select v-model="request.rating" class="border p-2 rounded">
                                <option v-for="value in [1, 2, 3, 4, 5]" :key="value" :value="value">
                                    {{ value }}
                                </option>
                            </select>
                            <button 
                                @click="closeRequest(request.id, request.rating)"
                                class="btn btn-secondary"
                            >
                                Close Request
                            </button>
                        </div>
                        
                    </div>
                </div>
                
                <!-- Edit form -->
                <div v-if="editingRequest && editingRequest.id === request.id" class="mt-4 p-4 bg-gray-50 rounded" style="margin-top: 5px;border: 2px solid rgb(185, 185, 185);border-radius: 10px; padding: 30px; margin: 10px">
                    <h3 class="font-semibold mb-4 text-center">Edit Request</h3>
                    <form @submit.prevent="submitEdit">
                        <div class="form-group">
                            <label class="block mb-2">Remarks:</label>
                            <textarea 
                                v-model="editingRequest.remarks"
                                class="w-full p-2 border rounded form-control"
                                rows="3"
                            ></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="block mb-2">Date of Completion:</label>
                            <input 
                                type="datetime-local"
                                v-model="editingRequest.date_of_completion"
                                class="w-full p-2 border rounded form-control"
                            >
                        </div>
                        
                        <div class="flex gap-2">
                            <button 
                                type="submit"
                                class="btn btn-dark"
                            >
                                Save Changes
                            </button>
                            <button 
                                type="button"
                                @click="cancelEdit"
                                class="btn btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    `,

    data() {
        return {
            requests: [],
            editingRequest: null
        }
    },

    mounted() {
        this.requests = JSON.parse(localStorage.getItem('requests')) || [];
        this.requests.forEach(request => {
            if (!request.rating) request.rating = null;
        });
    },

    methods: {
        formatDate(dateString) {
            if (!dateString) return 'Not set';
            const date = new Date(dateString);
            return date.toLocaleString();
        },

        getStatusClass(status) {
            const classes = {
                requested: 'text-yellow-600',
                assigned: 'text-blue-600',
                rejected: 'text-red-600',
                completed: 'text-green-600'
            };
            return classes[status] || '';
        },

        startEdit(request) {
            this.editingRequest = { ...request };
        },

        cancelEdit() {
            this.editingRequest = null;
        },

        async submitEdit() {
            try {
                const response = await fetch(`${location.origin}/customer/service-request/update/${this.editingRequest.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('token')
                    },
                    body: JSON.stringify({
                        remarks: this.editingRequest.remarks,
                        date_of_completion: this.editingRequest.date_of_completion
                    })
                });

                if (response.ok) {
                    alert('Request updated successfully!');
                    this.$router.push('/customer-dashboard');
                } else {
                    alert('Failed to update request');
                }
            } catch (error) {
                console.error('Error updating request:', error);
                alert('Error updating request');
            }
        },

        async closeRequest(requestId, rating) {
            if (!confirm('Are you sure you want to close this request?')) return;

            try {
                const response = await fetch(`${location.origin}/customer/service-request/close/${requestId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('token')
                    },
                    body: JSON.stringify({ rating })
                });

                if (response.ok) {
                    // Update the request status in the local array
                    alert('Request closed successfully!');
                    this.$router.push('/customer-dashboard');
                } else {
                    alert('Failed to close request');
                }
            } catch (error) {
                console.error('Error closing request:', error);
                alert('Error closing request');
            }
        }
    }
}