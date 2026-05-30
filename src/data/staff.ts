import type { StaffCard } from '../types/game'

export const staffCards: StaffCard[] = [
  // ===== One-time (一次性) =====
  {
    id: 's1', name: '游泳池服务员', nameEn: 'Pool Attendant',
    ability: 'emperor_advance_3', timing: 'one_time',
    description: '皇帝轨道前进3格', cost: 1, victoryPoints: 1,
  },
  {
    id: 's2', name: '咖啡师', nameEn: 'Barista',
    ability: 'get_4_coffee', timing: 'one_time',
    description: '获得4份咖啡', cost: 3, victoryPoints: 3,
  },
  {
    id: 's3', name: '主厨', nameEn: 'Chefkoch',
    ability: 'get_one_of_each', timing: 'one_time',
    description: '获得各1份食物（面包、蛋糕、红酒、咖啡）', cost: 3, victoryPoints: 3,
  },
  {
    id: 's4', name: '冷盘厨师', nameEn: 'Kaltmamsell',
    ability: 'get_4_strudel', timing: 'one_time',
    description: '获得4份面包', cost: 2, victoryPoints: 2,
  },
  {
    id: 's5', name: '糕点师', nameEn: 'Konditor',
    ability: 'get_4_cake', timing: 'one_time',
    description: '获得4份蛋糕', cost: 3, victoryPoints: 3,
  },
  {
    id: 's6', name: '侍者', nameEn: 'Page',
    ability: 'turn_2_rooms_occupied', timing: 'one_time',
    description: '将任意颜色的2个房间翻面标记为已入住', cost: 2, victoryPoints: 2,
  },
  {
    id: 's7', name: '门房', nameEn: 'Portier',
    ability: 'complete_guest_from_supply', timing: 'one_time',
    description: '从公共供应区拿取食物完成一位客人的订单', cost: 5, victoryPoints: 5,
  },
  {
    id: 's8', name: '品酒师', nameEn: 'Sommelier',
    ability: 'get_4_wine', timing: 'one_time',
    description: '获得4份红酒', cost: 2, victoryPoints: 2,
  },

  // ===== Once per round (每轮一次) =====
  {
    id: 's9', name: '酒吧服务员', nameEn: 'Barkeeper',
    ability: 'once_wine', timing: 'once_per_round',
    description: '每轮获得1份红酒', cost: 4, victoryPoints: 4,
  },
  {
    id: 's10', name: '早餐服务员', nameEn: 'Breakfast Server',
    ability: 'once_strudel', timing: 'once_per_round',
    description: '每轮获得1份面包', cost: 4, victoryPoints: 4,
  },
  {
    id: 's11', name: '女服务员', nameEn: 'Waitress',
    ability: 'once_cake', timing: 'once_per_round',
    description: '每轮获得1份蛋糕', cost: 6, victoryPoints: 6,
  },
  {
    id: 's12', name: '副主厨', nameEn: 'Sous Chef',
    ability: 'once_coffee', timing: 'once_per_round',
    description: '每轮获得1份咖啡', cost: 6, victoryPoints: 6,
  },

  // ===== Permanent (永久) =====
  {
    id: 's13', name: '信差', nameEn: 'Delivery Boy',
    ability: 'free_guest', timing: 'permanent',
    description: '可从游戏版图免费邀请客人', cost: 6, victoryPoints: 6,
  },
  {
    id: 's14', name: '管家', nameEn: 'Butler',
    ability: 'free_room_blue', timing: 'permanent',
    description: '可免费准备蓝色房间', cost: 5, victoryPoints: 5,
  },
  {
    id: 's15', name: '司机', nameEn: 'Chauffeur',
    ability: 'free_room_red', timing: 'permanent',
    description: '可免费准备红色房间', cost: 5, victoryPoints: 5,
  },
  {
    id: 's16', name: '装潢师', nameEn: 'Decorator',
    ability: 'die_1_2_build_room', timing: 'permanent',
    description: '每当你拿取点数1或2的骰子时，可额外准备1个房间', cost: 2, victoryPoints: 2,
  },
  {
    id: 's17', name: '楼层男服务员', nameEn: 'Male Floor Housekeeper',
    ability: 'serve_4dish_plus_4vp', timing: 'permanent',
    description: '每完成一位需要4份食物的客人额外获得4分', cost: 5, victoryPoints: 5,
  },
  {
    id: 's18', name: '花店店员', nameEn: 'Florist',
    ability: 'free_room_yellow', timing: 'permanent',
    description: '可免费准备黄色房间', cost: 5, victoryPoints: 5,
  },
  {
    id: 's19', name: '导游', nameEn: 'Tour Guide',
    ability: 'green_guest_plus_2vp', timing: 'permanent',
    description: '每完成一位绿色客人额外获得2分', cost: 2, victoryPoints: 2,
  },
  {
    id: 's20', name: '衣帽间服务员', nameEn: 'Checker',
    ability: 'die_5_discount_2', timing: 'permanent',
    description: '每当你拿取点数5的骰子时，获得2克朗折扣', cost: 2, victoryPoints: 2,
  },
  {
    id: 's21', name: '园丁', nameEn: 'Gardener',
    ability: 'emperor_bonus_5vp', timing: 'permanent',
    description: '每当你获得皇帝奖励时，额外获得5分', cost: 3, victoryPoints: 3,
  },
  {
    id: 's22', name: '女管家', nameEn: 'Executive Housekeeper',
    ability: 'die_3_4_plus_2vp', timing: 'permanent',
    description: '每当你拿取点数3或4的骰子时，额外获得2分', cost: 2, victoryPoints: 2,
  },
  {
    id: 's23', name: '酒店侦探', nameEn: 'Detective',
    ability: 'die_5_emperor_2', timing: 'permanent',
    description: '每当你拿取点数5的骰子时，皇帝轨道前进2格', cost: 2, victoryPoints: 2,
  },
  {
    id: 's24', name: '房屋管理员', nameEn: 'Custodian',
    ability: 'guest_to_room_plus_1kr', timing: 'permanent',
    description: '每当有客人入住房间时，获得1克朗', cost: 5, victoryPoints: 5,
  },
  {
    id: 's25', name: '室内设计师', nameEn: 'Interior Architect',
    ability: 'die_3_plus_5vp', timing: 'permanent',
    description: '每当你拿取点数3的骰子时，额外获得5分', cost: 3, victoryPoints: 3,
  },
  {
    id: 's26', name: '厨房帮手', nameEn: 'Kitchen Hand',
    ability: 'die_6_free_plus_reward', timing: 'permanent',
    description: '可免费拿取点数6的骰子，并获得该行动区骰数+1的奖励', cost: 3, victoryPoints: 3,
  },
  {
    id: 's27', name: '按摩师', nameEn: 'Masseuse',
    ability: 'yellow_guest_plus_1kr', timing: 'permanent',
    description: '每完成一位黄色客人额外获得1克朗', cost: 1, victoryPoints: 1,
  },
  {
    id: 's28', name: '首席服务员', nameEn: 'Chief Waiter',
    ability: 'free_serve_guest', timing: 'permanent',
    description: '可免费将厨房的食物送到客人手中', cost: 1, victoryPoints: 1,
  },
  {
    id: 's29', name: '人事主管', nameEn: 'Staff Manager',
    ability: 'die_3_hire_staff', timing: 'permanent',
    description: '每当你拿取点数3的骰子时，可雇佣1张员工卡', cost: 3, victoryPoints: 3,
  },
  {
    id: 's30', name: '马夫', nameEn: 'Groom',
    ability: 'red_guest_plus_2kr', timing: 'permanent',
    description: '每完成一位红色客人额外获得2克朗', cost: 4, victoryPoints: 4,
  },
  {
    id: 's31', name: '餐厅经理', nameEn: 'Restaurant Manager',
    ability: 'die_1_2_extra_resource', timing: 'permanent',
    description: '每当你拿取点数1或2的骰子时，额外获得1份对应的食物', cost: 2, victoryPoints: 2,
  },
  {
    id: 's32', name: '擦鞋匠', nameEn: 'Bootblack',
    ability: 'die_4_emperor_and_money', timing: 'permanent',
    description: '每当你拿取点数4的骰子时，皇帝和金钱各前进1格', cost: 4, victoryPoints: 4,
  },
  {
    id: 's33', name: '马厩管理员', nameEn: 'Stableman',
    ability: 'blue_guest_emperor_1', timing: 'permanent',
    description: '每完成一位蓝色客人，皇帝轨道前进1格', cost: 1, victoryPoints: 1,
  },
  {
    id: 's34', name: '活动策划经理', nameEn: 'Conference Manager',
    ability: 'no_emperor_penalty', timing: 'permanent',
    description: '你不受皇帝轨道0格惩罚的影响', cost: 5, victoryPoints: 5,
  },
  {
    id: 's35', name: '洗衣女工', nameEn: 'Laundress',
    ability: 'die_4_plus_4vp', timing: 'permanent',
    description: '每当你拿取点数4的骰子时，额外获得4分', cost: 2, victoryPoints: 2,
  },

  // ===== End of Game (游戏结束) =====
  {
    id: 's36', name: '礼宾员', nameEn: 'Concierge',
    ability: 'end_vp_per_blue_room', timing: 'end_of_game',
    description: '每个蓝色已入住房间获得3分', cost: 4, victoryPoints: 4,
  },
  {
    id: 's37', name: '经理助理', nameEn: 'Assistant Manager',
    ability: 'end_vp_per_staff', timing: 'end_of_game',
    description: '每张已雇佣的员工卡获得4分（含本卡）', cost: 4, victoryPoints: 4,
  },
  {
    id: 's38', name: '酒店经理', nameEn: 'Hotel Manager',
    ability: 'end_vp_per_color_set', timing: 'end_of_game',
    description: '每套3种不同颜色的已入住房间获得4分', cost: 4, victoryPoints: 4,
  },
  {
    id: 's39', name: '前台接待主管', nameEn: 'Reception Clerk',
    ability: 'end_vp_per_yellow_room', timing: 'end_of_game',
    description: '每个黄色已入住房间获得3分', cost: 4, victoryPoints: 4,
  },
  {
    id: 's40', name: '楼层女服务员', nameEn: 'Female Floor Housekeeper',
    ability: 'end_vp_per_floor', timing: 'end_of_game',
    description: '每个完全住满的行获得5分', cost: 2, victoryPoints: 2,
  },
  {
    id: 's41', name: '电梯服务员', nameEn: 'Liftboy',
    ability: 'end_vp_per_column', timing: 'end_of_game',
    description: '每个完全住满的列获得5分', cost: 4, victoryPoints: 4,
  },
  {
    id: 's42', name: '市场总监', nameEn: 'Marketing Director',
    ability: 'end_vp_per_politics', timing: 'end_of_game',
    description: '每张放置了标记的政治卡获得5分', cost: 2, victoryPoints: 2,
  },
  {
    id: 's43', name: '预订经理', nameEn: 'Booking Manager',
    ability: 'end_vp_per_red_room', timing: 'end_of_game',
    description: '每个红色已入住房间获得3分', cost: 4, victoryPoints: 4,
  },
  {
    id: 's44', name: '前台接待员', nameEn: 'Receptionist',
    ability: 'end_vp_per_room', timing: 'end_of_game',
    description: '每个房间（无论是否入住）获得1分', cost: 5, victoryPoints: 5,
  },
  {
    id: 's45', name: '秘书', nameEn: 'Secretary',
    ability: 'end_copy_staff', timing: 'end_of_game',
    description: '复制另一位玩家的一张员工卡技能', cost: 5, victoryPoints: 5,
  },
  {
    id: 's46', name: '电话接线员', nameEn: 'Operator',
    ability: 'end_double_emperor_vp', timing: 'end_of_game',
    description: '获得皇帝轨道显示分数的2倍', cost: 3, victoryPoints: 3,
  },
  {
    id: 's47', name: '客房服务', nameEn: 'Room Service',
    ability: 'end_vp_per_group', timing: 'end_of_game',
    description: '每个完全住满的房间组获得2分', cost: 3, victoryPoints: 3,
  },
  {
    id: 's48', name: '女客房服务员', nameEn: 'Chambermaid',
    ability: 'end_vp_per_occupied_room', timing: 'end_of_game',
    description: '每个已入住房间获得1分', cost: 4, victoryPoints: 4,
  },
]
