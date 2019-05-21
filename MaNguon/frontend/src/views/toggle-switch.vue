<template>
  <div class="checkbox-slider">
    <input type="checkbox" v-model="checked" @change="onChange" id="checkbox">
    <label for="checkbox" class="slider"></label>
    <label for="checkbox">
      <div id="status"></div>
    </label>
  </div>
</template>
<style scoped>
.checkbox-slider {
  display: flex;
  align-items: center;
}
.slider {
  position: relative;
  margin-right: 10px;
  width: 50px;
  height: 30px;
  background: #ddd;
  transition: 0.4s;
  border-radius: 15px;
  cursor: pointer;
}
.slider::before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 5px;
  top: 5px;
  background: white;
  transition: 0.4s;
  border-radius: 50%;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.15);
}
input {
  display: none;
}
input:checked + .slider {
  background: green;
}
input:checked + .slider::before {
  transform: translateX(20px);
}
</style>
<script>
// import Vue from 'vue'

export default {
  props: {
    defaultChecked: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      checked: this.defaultChecked
    };
  },
  methods: {
    onChange() {
      // alert(this.checked);
      if (this.checked === true) {
        document.getElementById("status").innerHTML = "online";
      } else {
        document.getElementById("status").innerHTML = "offline";
      }
      this.$emit("input", this.checked);
    }
    // checkboxToggle() {
    //   alert(this.checked);
    // }
  },
  mounted() {
    if (this.checked === true) {
      document.getElementById("status").innerHTML = "online";
    } else {
      document.getElementById("status").innerHTML = "offline";
    }
  }
};
</script>
