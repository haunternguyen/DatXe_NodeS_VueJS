<template>
  <div class="request-component">
    <h1 class="header">Các yêu cầu của khách</h1>
    <div class="g-margin-bot-10">
      <a-button type="primary" @click="openModal">Thêm yêu cầu</a-button>
    </div>
    <a-table :columns="columns"
      :rowKey="record => { return record.id }"
      :dataSource="data"
      :pagination="pagination"
      :loading="loading"
      @change="handleTableChange"
    >
      <template slot="operation" slot-scope="text, record">
        <a-button type="primary" @click="(e) => { openModal(e, record.id) }">Sửa</a-button>
        <a-popconfirm
          v-if="data.length"
          title="Bạn có chắc không ?"
          @confirm="() => { handleDelete(record.id) }">
          <a-button type="danger">Xoá</a-button>
        </a-popconfirm>
      </template>
    </a-table>
    <a-modal
      title="Customer Request"
      :visible="modalState.visible"
      @ok="handleOkModal"
      :confirmLoading="modalState.confirmLoading"
      @cancel="handleCancelModal"
    >
      <a-form @submit="handleOkModal" layout="vertical" :autoFormCreate="(form)=>{this.form = form}">
        <a-form-item
          label='Tên khách'
          fieldDecoratorId="name"
          :fieldDecoratorOptions="{rules: [{ required: true, message: 'Chưa nhập tên!' }]}"
        >
          <a-input />
        </a-form-item>
        <a-form-item
          label='Địa chỉ đón'
          fieldDecoratorId="pickupAddress"
          :fieldDecoratorOptions="{rules: [{ required: true, message: 'Chưa nhập địa chỉ đón!' }]}"
        >
          <a-input />
        </a-form-item>
        <a-form-item
          label='Địa chỉ trả'
          fieldDecoratorId="destAddress"
        >
          <a-input />
        </a-form-item>
        <a-form-item
          label='Số điện thoại'
          fieldDecoratorId="phone"
        >
          <a-input />
        </a-form-item>
        <a-form-item
          label='Ghi chú'
          fieldDecoratorId="note"
        >
          <a-input type="textarea" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import axios from 'axios';

const columns = [{
  title: 'ID',
  dataIndex: 'id',
}, {
  title: 'Tên khách',
  dataIndex: 'name',
  sorter: true,
  width: '20%'
}, {
  title: 'Địa chỉ đón',
  dataIndex: 'pickupAddress',
}, {
  title: 'Địa chỉ trả',
  dataIndex: 'destAddress',
}, {
  title: 'SĐT',
  dataIndex: 'phone',
}, {
  title: 'Ghi chú',
  dataIndex: 'note',
}, {
  title: ' -- ',
  dataIndex: 'operation',
  scopedSlots: { customRender: 'operation' },
}];

export default {
  name: 'request',
  components: {
  },
  mounted() {
    this.fetch();
  },
  data() {
    return {
      data: [],
      pagination: {},
      loading: false,
      columns,
      selected: undefined,
      modalState: {
        visible: false,
        confirmLoading: false
      }
    }
  },
  methods: {
    fetch (params = {}) {
      this.loading = true
      axios({
        url: 'http://localhost:5858/api/v1/request',
        method: 'get',
        params: {
          results: 10,
          ...params,
        },
        type: 'json',
      }).then((result) => {
        if (result && result.data) {
          const pagination = { ...this.pagination };
          this.loading = false;
          this.data = result.data;
          this.pagination = pagination;
        }
      }).catch(() => this.loading = false);
    },
    handleTableChange (pagination, filters, sorter) {
      const pager = { ...this.pagination };
      pager.current = pagination.current;
      this.pagination = pager;
      this.fetch({
        results: pagination.pageSize,
        page: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order,
        ...filters,
      });
    },
    handleStatusChange (value) {
      this.form.setFieldsValue({
        status: value,
      })
    },
    openModal (evt, id) {
      this.modalState.visible = true;
      setTimeout(() => {
        this.form.resetFields();
        if (id) {
          axios({
              url: `http://localhost:5858/api/v1/request/${id}`,
              method: 'get',
              type: 'json',
            }).then((result) => {
              this.selected = result.data;
              this.form.setFieldsValue(result.data);
            }).catch(() => this.selected = undefined)
        } else {
          this.selected = undefined;
        }
      }, 100)
    },
    handleOkModal (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          const formData = { ...values, status: 'received', reversedAddress: values.pickupAddress };
          const opts = {
            url: 'http://localhost:5858/api/v1/request',
            method: 'post',
            data: formData,
            type: 'json',
          }
          if (this.selected && this.selected.id) {
            opts.url = `http://localhost:5858/api/v1/request/${this.selected.id}`
            opts.method = 'put'
          }
          axios(opts).then(() => {
            this.modalState.visible = false;
            this.modalState.confirmLoading = false;
            this.form.resetFields();
            this.fetch();
          }).catch(() => this.modalState.confirmLoading = false);
        }
      })
    },
    handleCancelModal () {
      this.modalState.visible = false;
    },
    handleDelete(id) {
      axios({
        url: `http://localhost:5858/api/v1/request/${id}`,
        method: 'delete',
        type: 'json',
      }).then(() => {
        this.fetch();
      });
    }
  }
}
</script>

<style>
.request-component {
}
</style>
