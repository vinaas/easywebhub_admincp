'use strict';

const restify = require('restify');
const shiroTrie = require('shiro-trie');
const EventEmitter = require('events');
const _ = require('lodash');

// const RoleModel = require(__dirname + '/role-model.js');



class Acl extends EventEmitter {
    constructor() {
        super();
        // this.loadRole();
        // this.on('AclChanged', function () {
        //     this.loadRole();
        // });
        this.ForbiddenError = new restify.ForbiddenError();
    }

    loadRole() {
        return RoleModel.query()
            .then(entries => {
                let tmpRoleMap = {};

                // group role
                entries.forEach(entry => {
                    let role;
                    if (tmpRoleMap.hasOwnProperty[entry.role])
                        role = tmpRoleMap[entry.role];
                    else
                        role = shiroTrie.new();
                    role.add(entry.permission);

                });

                this.roleMap = tmpRoleMap;
            });
    }

    middleware() {
        const me = this;
        return function (req, res, next) {
            if (req.session === undefined || req.session.role === undefined)
                return next(me.ForbiddenError);

            var routePath = req.url;
            // remove prefix /
            if (routePath.substr(0, 1) == '/')
                routePath = routePath.substr(1);
            // remove suffix /
            if (routePath.substr(-1) == '/')
                routePath = routePath.substr(0, routePath.length - 1);

            routePath = routePath.replace(/\//g, ':');
            if (routePath == '') routePath = 'index.html';

            let permissionPath = `${req.method.toLowerCase()}:${routePath}`;
            //console.log('routePath', routePath, permissionPath);
            let aclRole = me.roleMap[req.session.role];
            // forbidden if role not exists
            if (aclRole === undefined)
                return next(me.ForbiddenError);

            //console.log(JSON.stringify(aclRole.data, null, 4));
            // check role permission
            if (aclRole.check(permissionPath) == false)
                return next(me.ForbiddenError);

            return next();
        }
    }
}

module.exports = Acl;
