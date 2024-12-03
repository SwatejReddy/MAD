export default {
    template: `
    <div style="display: flex; justify-content: center; align-items: center; margin-top: 150px;">
        <div style="margin: auto; width: 50%; border: 2px solid rgb(185, 185, 185); margin-top:20px; background-color: white; padding: 20px;">
            <h1 style="text-align: center; color: black; font-weight: bolder;">All Services</h1>
            <button @click="toggleCreateForm" class="btn btn-dark">Create Service</button>

            <!-- Create Service Form -->
            <div v-if="showCreateForm" class="mt-4 p-4 bg-gray-50 rounded" style="margin: auto; width: 50%; border: 2px solid rgb(185, 185, 185); background-color: white; padding: 20px;">
                <h3 class="font-semibold mb-4">Create Service</h3>
                <form @submit.prevent="createService">
                    <div class="mb-4">
                        <label class="block mb-2">Name:</label>
                        <input v-model="newService.name" class="w-full p-2 border rounded">
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2">Base Price:</label>
                        <input v-model="newService.base_price" class="w-full p-2 border rounded">
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2">Description:</label>
                        <textarea v-model="newService.description" class="w-full p-2 border rounded" rows="3"></textarea>
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2">Estimated Time:</label>
                        <input v-model="newService.estimated_time" class="w-full p-2 border rounded">
                    </div>
                    <button type="submit" class="btn btn-dark">Create</button>
                    <button type="button" @click="toggleCreateForm" class="btn btn-secondary">Cancel</button>
                </form>
            </div>

            <!-- Services List -->
            <div v-for="service in services" :key="service.id" style="text-align: left; margin: 2px 0px 2px 10px;">
                <p style="margin-top: 20px;">ID: {{ service.id }}</p>
                <p>Name: {{ service.name }}</p>
                <p>Base Price: {{ service.base_price }}</p>
                <p>Created At: {{ service.created_at }}</p>
                <p>Description: {{ service.description }}</p>
                <p>Estimated Time: {{ service.estimated_time }}</p>
                <button @click="deleteService(service)" class="btn btn-dark">Delete</button>
                <button @click="startEdit(service)" class="btn btn-secondary">Edit</button>
            </div>

            <!-- Edit Service Form -->
            <div v-if="editingService" class="mt-4 p-4 bg-gray-50 rounded" style="margin: auto; width: 50%; border: 2px solid rgb(185, 185, 185); margin-top:20px; background-color: white; padding: 20px;">
                <h3 class="font-semibold mb-4">Edit Service</h3>
                <form @submit.prevent="submitEdit">
                    <div class="mb-4">
                        <label class="block mb-2">Name:</label>
                        <input v-model="editingService.name" class="w-full p-2 border rounded">
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2">Base Price:</label>
                        <input v-model="editingService.base_price" class="w-full p-2 border rounded">
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2">Description:</label>
                        <textarea v-model="editingService.description" class="w-full p-2 border rounded" rows="3"></textarea>
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2">Estimated Time:</label>
                        <input v-model="editingService.estimated_time" class="w-full p-2 border rounded">
                    </div>
                    <div class="flex gap-2">
                        <button type="submit" class="btn btn-dark">Save Changes</button>
                        <button type="button" @click="cancelEdit" class="btn btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            services: [],
            editingService: null,
            showCreateForm: false,
            newService: {
                name: '',
                base_price: '',
                description: '',
                estimated_time: ''
            }
        };
    },
    mounted() {
        const storedServices = localStorage.getItem('services');
        if (storedServices) {
            this.services = JSON.parse(storedServices);
        }
    },
    methods: {
        toggleCreateForm() {
            this.showCreateForm = !this.showCreateForm;
        },
        async createService() {
            try {
                const response = await fetch(`${location.origin}/admin/service/new`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('token')
                    },
                    body: JSON.stringify(this.newService)
                });

                if (response.ok) {
                    alert('Service created successfully!');
                    this.$router.push('/admin-dashboard');
                } else {
                    const errorMessage = (await response.json()).message;
                    alert(`Failed to create service: ${errorMessage}`);
                }
            } catch (error) {
                console.error('Error creating service:', error);
                alert('An error occurred while creating the service.');
            }
        },
        async deleteService(service) {
            if (!confirm(`Are you sure you want to delete service: ${service.name}?`)) return;

            try {
                const response = await fetch(`${location.origin}/admin/service/delete/${service.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authentication-Token': localStorage.getItem('token')
                    }
                });

                if (response.ok) {
                    alert('Service deleted successfully!');
                    this.$router.push('/admin-dashboard')
                } else {
                    const errorMessage = (await response.json()).message;
                    alert(`Failed to delete service: ${errorMessage}`);
                }
            } catch (error) {
                console.error('Error deleting service:', error);
                alert('An error occurred while deleting the service.');
            }
        },
        startEdit(service) {
            this.editingService = { ...service };
        },
        cancelEdit() {
            this.editingService = null;
        },
        async submitEdit() {
            if (!this.editingService) return;

            try {
                const response = await fetch(
                    `${location.origin}/admin/service/edit/${this.editingService.id}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authentication-Token': localStorage.getItem('token')
                        },
                        body: JSON.stringify({
                            name: this.editingService.name,
                            description: this.editingService.description,
                            base_price: this.editingService.base_price,
                            estimated_time: this.editingService.estimated_time
                        })
                    }
                );

                if (response.ok) {
                    alert('Service updated successfully!');
                    this.services = this.services.map(service =>
                        service.id === this.editingService.id
                            ? { ...service, ...this.editingService }
                            : service
                    );
                    this.editingService = null;
                } else {
                    const errorMessage = (await response.json()).message;
                    alert(`Failed to update service: ${errorMessage}`);
                }
            } catch (error) {
                console.error('Error updating service:', error);
                alert('An error occurred while updating the service.');
            }
        }
    }
};
