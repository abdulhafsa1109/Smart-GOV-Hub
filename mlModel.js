// mlModel.js  SMART EARLY PREDICTION VERSION

export async function predictPreferredCategory(searches){

  //  No data
  if(!searches || searches.length === 0){
    return null;
  }

  // ONLY ONE SEARCH → QUICK PREDICTION
  if(searches.length === 1){
    console.log("Quick ML Prediction:", searches[0]);
    return searches[0];
  }

  // REAL ML TRAINING STARTS HERE

  const categoryMap = {};
  let index = 0;

  searches.forEach(cat=>{
    if(!(cat in categoryMap)){
      categoryMap[cat] = index++;
    }
  });

  const reverse = Object.keys(categoryMap);
  const numeric = searches.map(c=>categoryMap[c]);

  const model = tf.sequential();

  model.add(tf.layers.dense({
    units:8,
    inputShape:[1],
    activation:"relu"
  }));

  model.add(tf.layers.dense({
    units:reverse.length,
    activation:"softmax"
  }));

  model.compile({
    optimizer:"adam",
    loss:"sparseCategoricalCrossentropy"
  });

  const xs = tf.tensor2d(numeric,[numeric.length,1]);
  const ys = tf.tensor1d(numeric,"int32");

  // TRAIN MODEL
  await model.fit(xs,ys,{epochs:20})
  // PREDICT BASED ON LAST BEHAVIOUR
  const pred = model.predict(
    tf.tensor2d([numeric[numeric.length-1]],[1,1])
  );

  const result = pred.argMax(1).dataSync()[0];

  console.log("Neural ML Prediction:", reverse[result]);

  return reverse[result];
}