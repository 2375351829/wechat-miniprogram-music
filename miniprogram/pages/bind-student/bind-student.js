const app = getApp();
const { userApi } = require('../../services/api');
const { showLoading, hideLoading, showSuccess, showError } = require('../../utils/util');

Page({
  data: {
    form: {
      student_id: '',
      real_name: '',
      college: '',
      major: '',
      grade: '',
      class_name: '',
      enrollment_year: ''
    },
    collegeList: ['信息工程学院', '经济管理学院', '人文学院', '外国语学院', '艺术学院', '理学院', '机械工程学院', '土木工程学院'],
    gradeList: ['2020级', '2021级', '2022级', '2023级', '2024级', '2025级'],
    yearList: ['2020', '2021', '2022', '2023', '2024', '2025'],
    showCollegePicker: false,
    showGradePicker: false,
    showYearPicker: false
  },

  onLoad(options) {
    if (!app.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return;
    }
    
    const userInfo = app.globalData.userInfo || {};
    this.setData({
      form: {
        student_id: userInfo.student_id || '',
        real_name: userInfo.real_name || '',
        college: userInfo.college || '',
        major: userInfo.major || '',
        grade: userInfo.grade || '',
        class_name: userInfo.class_name || '',
        enrollment_year: userInfo.enrollment_year || ''
      }
    });
  },

  onStudentIdInput(e) {
    this.setData({
      'form.student_id': e.detail.value
    });
  },

  onRealNameInput(e) {
    this.setData({
      'form.real_name': e.detail.value
    });
  },

  onCollegeInput(e) {
    this.setData({
      'form.college': e.detail.value
    });
  },

  onMajorInput(e) {
    this.setData({
      'form.major': e.detail.value
    });
  },

  onGradeInput(e) {
    this.setData({
      'form.grade': e.detail.value
    });
  },

  onClassInput(e) {
    this.setData({
      'form.class_name': e.detail.value
    });
  },

  onYearInput(e) {
    this.setData({
      'form.enrollment_year': e.detail.value
    });
  },

  showCollegePicker() {
    this.setData({ showCollegePicker: true });
  },

  hideCollegePicker() {
    this.setData({ showCollegePicker: false });
  },

  selectCollege(e) {
    const college = e.currentTarget.dataset.value;
    this.setData({
      'form.college': college,
      showCollegePicker: false
    });
  },

  showGradePicker() {
    this.setData({ showGradePicker: true });
  },

  hideGradePicker() {
    this.setData({ showGradePicker: false });
  },

  selectGrade(e) {
    const grade = e.currentTarget.dataset.value;
    this.setData({
      'form.grade': grade,
      showGradePicker: false
    });
  },

  showYearPicker() {
    this.setData({ showYearPicker: true });
  },

  hideYearPicker() {
    this.setData({ showYearPicker: false });
  },

  selectYear(e) {
    const year = e.currentTarget.dataset.value;
    this.setData({
      'form.enrollment_year': year,
      showYearPicker: false
    });
  },

  async submitBind() {
    const { form } = this.data;
    
    if (!form.student_id) {
      showError('请输入学号');
      return;
    }
    
    if (!form.real_name) {
      showError('请输入真实姓名');
      return;
    }
    
    showLoading('绑定中...');
    
    try {
      const res = await userApi.bindStudent(form);
      
      hideLoading();
      showSuccess('绑定成功');
      
      app.globalData.userInfo = {
        ...app.globalData.userInfo,
        ...res.data
      };
      wx.setStorageSync('userInfo', app.globalData.userInfo);
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      hideLoading();
      showError(err.message || '绑定失败');
    }
  }
});
