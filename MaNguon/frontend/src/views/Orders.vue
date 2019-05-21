<template>
  <div class="card">
    <div class="card-header h4">Orders</div>
    <div class="card-body">
      <p class="card-text">orders</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import EventBus from "@/components/EventBus";

export default {
  methods: {
    getOrder() {
      var self = this;
      if (localStorage.getItem("usertoken") !== null) {
        axios
          .get("http://localhost:3000/orders", {
            headers: { "x-access-token": localStorage.getItem("usertoken") },
            params: {
              refreshtoken: localStorage.getItem("refreshtoken")
            }
          })
          .then(response => {
            //this.info = response.data.bpi
            alert(response.data.msg);
            if (response.data.msg == "newtoken") {
              localStorage.setItem("usertoken", response.data.access_token);
            }
            EventBus.$emit("logged-in", "ok");
          })
          .catch(error => {
            console.log(error);
            alert(error);
            this.errored = true;
            EventBus.$emit("logged-in", "");
          })
          .finally(() => (this.loading = false));
      }
      else{
        self.$router.push('/login');
        EventBus.$emit('logged-in', '')
        return;
      }
    }
  },
  mounted() {
    this.getOrder();
  }
};
</script>