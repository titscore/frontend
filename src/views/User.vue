<template>
    <div class="container">
        <div class="row align-items-center profile-header">
            <div class="col-md-2 mb-3">
                <img :src="$auth.user.picture" alt="User's profile picture" class="rounded-circle img-fluid profile-picture" />
            </div>
            <div class="col-md text-center text-md-left">
                <h2>{{ $auth.user.name }}</h2>
                <p class="lead text-muted">{{ $auth.user.email }}</p>
            </div>
        </div>

        <div class="row">
            <pre>{{ JSON.stringify($auth.user, null, 2) }}</pre>
        </div>

        <div v-if="!$auth.loading">
            <!-- show login when not authenticated -->
            <v-btn v-if="!$auth.isAuthenticated" @click="login">Log in</v-btn>
            <!-- show logout when authenticated -->
            <v-btn v-if="$auth.isAuthenticated" @click="logout">Log out</v-btn>
        </div>
    </div>
</template>
<script>
export default {
    name: 'user',
    components: {},
    methods: {
        // Log the user in
        login() {
            this.$auth.loginWithRedirect()
        },
        // Log the user out
        logout() {
            this.$auth.logout({
                returnTo: window.location.origin,
            })
        },
    },
}
</script>
