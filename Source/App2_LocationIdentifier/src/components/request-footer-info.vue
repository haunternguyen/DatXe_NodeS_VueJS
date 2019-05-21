<template>
  <p>Ghi chú: {{selectedRequest ? selectedRequest.note : 'Chưa chọn'}}</p>
</template>

<style scoped>
</style>  
<script>
import appStore from "../stores/appStore.js";

export default {
  props: {},
  mounted() {},
  data() {
    return {};
  },
  computed: {
    selectedRequest() {
      return appStore.state.selectedRequest;
    }
  }
};
</script>
