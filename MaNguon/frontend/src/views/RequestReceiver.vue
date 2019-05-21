<template>
  <div class="row">
    <div class="col-sm-8">
      <b-container fluid>
        <b-table
          :fields="fields"
          :items="list"
          :current-page="currentPage"
          :per-page="perPage"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
        >
          <!-- A virtual column -->
          <template slot="HoTen" slot-scope="data">{{data.item.HoTen}}</template>
          <template slot="DiaChi" slot-scope="data">
            {{data.item.DiaChi}}
            <b-btn size="sm" @click="myRowClickHandler(data.item.DiaChi)">Details</b-btn>
          </template>
          <template slot="GhiChu" slot-scope="data">{{data.item.GhiChu}}</template>
          <template
            slot="ThoiGianNhan"
            slot-scope="data"
          >{{new Date(data.item.ThoiGianNhan).toLocaleString()}}</template>
        </b-table>
        <b-row>
          <b-col md="6" class="my-1">
            <b-pagination
              :total-rows="totalRows"
              :per-page="perPage"
              v-model="currentPage"
              class="my-0"
            />
          </b-col>
        </b-row>
        <p>
          Sắp xếp theo:
          <b>{{ sortBy }}</b>,
          Thứ tự:
          <b>{{ sortDesc ? 'Giảm dần' : 'Tăng dần' }}</b>
        </p>
      </b-container>
    </div>
    <div class="col-sm">
      <form @submit.prevent="sendRequest">
        <div class="gorm-group">
          <label for="user">Họ tên:</label>
          <input type="text" v-model="HoTen" class="form-control">
        </div>
        <div class="gorm-group pb-3">
          <label for="message">Địa chỉ:</label>
          <input type="text" v-model="DiaChi" class="form-control">
        </div>
        <div class="gorm-group pb-3">
          <label for="message">Ghi chú:</label>
          <input type="text" v-model="GhiChu" class="form-control">
        </div>
        <button type="submit" class="btn btn-success">Send</button>
      </form>
    </div>
  </div>
</template>
<script>
// const items = [
//   { isActive: true, age: 40, first_name: "Dickerson", last_name: "Macdonald" },
//   { isActive: false, age: 21, first_name: "Larsen", last_name: "Shaw" },
//   { isActive: false, age: 89, first_name: "Geneva", last_name: "Wilson" },
//   { isActive: true, age: 38, first_name: "Jami", last_name: "Carney" }
// ];
import EventBus from "@/components/EventBus";
import axios from "axios";
import moment from "moment";
import io from "socket.io-client";
export default {
  data() {
    return {
      fields: [
        { key: "HoTen", label: "Họ Tên", sortable: true },
        { key: "DiaChi", label: "Địa Chỉ", sortable: true },
        { key: "GhiChu", label: "Ghi Chú", sortable: true },
        { key: "ThoiGianNhan", label: "Thời Gian Nhận", sortable: true }
      ],
      list: [],
      HoTen: "",
      DiaChi: "",
      GhiChu: "",
      ThoiGianNhan: "",
      socket: io("localhost:3001"),
      currentPage: 1,
      perPage: 4,
      totalRows: 0,
      pageOptions: [5, 10, 15],
      sortBy: "Thời Gian Nhận",
      sortDesc: false
    };
  },
  methods: {
    getLogin() {
      EventBus.$emit("logged-in", "ok");
    },
    sendRequest(e) {
      e.preventDefault();
      axios({
        method: "post",
        url: "http://localhost:3000/requestReceiver",
        data: {
          HoTen: this.HoTen,
          DiaChi: this.DiaChi,
          GhiChu: this.GhiChu,
          ThoiGianNhan: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
          X: null,
          Y: null,
          XThuCong: null,
          YThuCong: null,
          requeststatusid: 0
        }
        // eslint-disable-next-line
      }).then(res => {
        // console.log(res.data);
        this.socket.emit("SEND_MESSAGE", {
          data: "Du lieu chat"
        });
        //alert(res.data.msg);
      });
    },
    myRowClickHandler(value) {
      // 'record' will be the row data from items
      // `index` will be the visible row number (available in the v-model 'shownItems')
      // alert(value); // This will be the item data for the row
      this.DiaChi = value;
    }
  },
  mounted() {
    this.getLogin();
    var self = this;
    axios
      .get("http://localhost:3000/requestReceiver")
      .then(res => {
        self.list = res.data;
        self.totalRows = self.list.length;
      })
      .catch(err => {
        console.log(err);
      });
    this.socket.on("MESSAGE", data => {
      // console.log(data);
      // alert(" chat la" + data);
      self.list = data;
      self.totalRows = self.list.length;
      // you can also do this.messages.push(data)
    });
  }
};
</script>

