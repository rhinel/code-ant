// 初始化范围内随机数
const random = function (start, end) {
  const length = end - start + 1;
  return Math.floor(Math.random() * length + start);
}

const peopleLength = 100;
const peopleLinkMin = 1;
const peopleLinkMax = 20;

const oneTryTimes = 100;
const groupOneTryTimes = 1000;

const showConsole = false;

// 人数关系信息
const people = [];
for (let i = 0; i < peopleLength; i++) {
  people.push({
    id: i,
    linkCount: random(peopleLinkMin, peopleLinkMax),
    link: [],
  })

  people[i].symbolSize = people[i].linkCount + 10;
}

// 生成人物关系数据
const peopleLink = [];
let peopleLinkLength = people
  .reduce((a, b) => a + b.linkCount, 0);

while (peopleLinkLength % 2 == 1) {
  const _people = people[random(0, people.length - 1)];
  if (_people.linkCount < 30) {
    _people.linkCount += 1;
    peopleLinkLength += 1;
  }
}

while (peopleLink.length < peopleLinkLength / 2) {
  const peopleRest = people
    .filter(_ => _.link.length < _.linkCount);

  const _people1 = peopleRest
    .reduce((a, b) => {
      return a.linkCount - a.link.length > b.linkCount - b.link.length ?
        a : b;
    });
  const _people2 = peopleRest
    .filter(_ => _.id != _people1.id)[random(0, peopleRest.length - 2)];

  if (_people1.id != _people2.id) {
    _people1.link.push({
      source: _people1.id,
      target: _people2.id,
      pheromone: 0,
    });
    _people2.link.push({
      source: _people2.id,
      target: _people1.id,
      pheromone: 0,
    });
    peopleLink.push({
      source: _people1.id,
      target: _people2.id,
    });
  }
}

console.log('所有人：', people);
console.log('所有人物关系：', peopleLink);

// 随机查找，起点上色
const peopleStart = people[random(0, people.length - 1)];
// 显示
peopleStart.itemStyle = {
  normal: {
    borderColor: 'blue',
    borderWidth: 1,
    shadowBlur: 10,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
  }
}
const peopleEnd = people
  .filter(_ => _.id != peopleStart.id)[random(0, people.length - 2)];
// 显示
peopleEnd.itemStyle = {
  normal: {
    borderColor: 'black',
    borderWidth: 1,
    shadowBlur: 10,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
  }
}

console.log('起点：', peopleStart.id);
console.log('终点：', peopleEnd.id);

// 一次搜寻
const oneTry = (show) => {
  const searchPeople = new Set();
  const searchLine = [];
  let searchDone = [];
  let count = 0;
  let falseCount = 0;

  while ((!(count > 3 && falseCount == count) || falseCount < 10) && !searchDone.length) {
    const thisLinePeople = [];
    let thisLineNext = peopleStart;
    thisLinePeople.push(thisLineNext.id);

    while (thisLineNext && !searchDone.length) {
      let thisCanChoose = thisLineNext.link
        .filter(_ => !thisLinePeople.includes(_.target));

      // 信息素信息
      const pheromone = thisCanChoose
        .filter(_ => _.pheromone > 0);
      // const noPheromone = thisCanChoose
      //   .filter(_ => _.pheromone == 0);

      // thisCanChoose = [];
      pheromone.forEach(i => {
        for (let j = 0; j < i.pheromone; j++) {
          thisCanChoose.push(i);
        }
      });

      // const fix = Math.floor(
      //   Math.floor(
      //     noPheromone.length / (thisCanChoose.length + noPheromone.length) * 10
      //   )
      //   * (thisCanChoose.length + noPheromone.length) / 10
      // );

      // for (let i = 0; i < fix; i++) {
      //   const randomIndex = random(0, noPheromone.length - 1);
      //   thisCanChoose.push(noPheromone[randomIndex]);
      //   noPheromone.splice(randomIndex, 1);
      // }

      // next节点
      if (thisCanChoose.length) {
        thisLineNext = people[thisCanChoose[random(0, thisCanChoose.length - 1)].target];
        thisLinePeople.push(thisLineNext.id);
        if (thisLineNext.id == peopleEnd.id) {
          searchDone = thisLinePeople;
          searchLine.push(thisLinePeople);
          searchPeople.add(...thisLinePeople);
        }
      } else {
        thisLineNext = null;
        count += 1;
        if (!searchLine.filter(_ => JSON.stringify(_) == JSON.stringify(thisLinePeople)).length) {
          searchLine.push(thisLinePeople);
        } else {
          falseCount += 1;
        }
        searchPeople.add(...thisLinePeople);
      }
    }
  }

  showConsole && console.log('寻找过程：', searchLine);
  showConsole && console.log('成功线路：', searchDone);

  // 显示
  if (!show) return {
    searchLine,
    searchDone,
  };
  const searchDoneLink = [];
  for (let i = 0; i < searchDone.length - 1; i++) {
    searchDoneLink.push(JSON.stringify({
      source: searchDone[i],
      target: searchDone[i + 1],
    }));
    searchDoneLink.push(JSON.stringify({
      source: searchDone[i + 1],
      target: searchDone[i],
    }));
  }

  peopleLink.forEach(link => {
    if (searchDoneLink.includes(JSON.stringify(link))) {
      link.lineStyle = {
        color: 'green',
        width: 2,
      }
    }
  });

  return {
    searchLine,
    searchDone,
  };
}

// 一组查询
const groupOneTry = () => {
  let minOneTrySearchDone = Number.MAX_VALUE;
  let minOneTrySearchDoneDet = [];
  const groupOneTryDet = [];

  // 执行
  for (let i = 0; i < oneTryTimes; i++) {
    showConsole && console.log('oneTry：', i);
    const oneTrySearchDone = oneTry();
    groupOneTryDet.push(oneTrySearchDone.searchDone.length);
    if (minOneTrySearchDone > oneTrySearchDone.searchDone.length) {
      minOneTrySearchDone = oneTrySearchDone.searchDone.length;
      minOneTrySearchDoneDet = oneTrySearchDone.searchDone;
    }
  }

  // 记录信息素
  for (let i = 0; i < minOneTrySearchDoneDet.length; i++) {
    people[minOneTrySearchDoneDet[i]].link.forEach(j => {
      if (j.target == minOneTrySearchDoneDet[i + 1]) {
        j.pheromone += 1;
      }
    });
  }

  showConsole && console.log('多次重复结果：', groupOneTryDet);
  showConsole && console.log('最短一次：', minOneTrySearchDone);

  return groupOneTryDet;
}

// 执行多组查询
const groupTrySuccess = [];
for (let i = 0; i < groupOneTryTimes; i++) {
  const group = groupOneTry();
  groupTrySuccess.push(group);
}

console.log('所有重复结果：', groupTrySuccess);
