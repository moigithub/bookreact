import webpack from 'webpack';
import config from './webpack.config.prod';

process.env.NODE_ENV = 'production';

console.log("Generated minified bundle for production....");

webpack(config).run((err,stats)=>{
    if(err){
        console.log(err);
        return 1;
    }
    
    const jsonStats = stats.toJson();
    if(jsonStats.hasErrors){
        return jsonStats.errors.map(error=> console.log(error));
    }
    
    if(jsonStats.hasWarnings){
        console.log('webpack warnings..');
        jsonStats.warnings.map(warning => console.log(warning));
    }
    
    console.log('webpack stats: ', stats);
    
    console.log('build completed');
    return 0;
});